import Pusher from 'pusher-js'
import { useChatApi } from '../services/chat.api'
import { useChatStore } from '../stores/chat.store'
import { useProfileStore } from '../stores/profile.store'
import { useAuthStore } from '~~/layers/core/app/stores/auth.store'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'
import type { IConversation, IMessage } from '../types/profile.types'

// Normalize a raw server conversation into IConversation with `otherUser`
// Works for both user-to-user and user-to-store conversations.
function normalizeConversation(raw: any, currentUserId: string): IConversation {
  let otherUser = null

  if (raw.sellerId) {
    // Store conversation — represent the store as the "other party"
    // The UI will use otherUser.isStore + otherUser.storeName + otherUser.avatar
    otherUser = raw.seller
      ? {
          id: raw.seller.id,
          username: raw.seller.store_name || raw.seller.storeSlug,
          name: raw.seller.store_name,
          avatar: raw.seller.store_logo || null,
          isStore: true,
          storeSlug: raw.seller.storeSlug,
        }
      : null
  } else {
    otherUser =
      raw.participant1Id === currentUserId
        ? raw.participant2 ?? null
        : raw.participant1 ?? null
  }

  return { ...raw, otherUser }
}

// ─── Pusher singleton ─────────────────────────────────────────────────────────
// One Pusher client shared across the whole app.
// Soketi is Pusher-compatible — we just point it at our self-hosted host.
let pusherClient: Pusher | null = null
let currentUserId: string | null = null

export const useChat = () => {
  const chatApi = useChatApi()
  const chatStore = useChatStore()
  const profileStore = useProfileStore()
  const authStore = useAuthStore()

  const isLoading = computed(() => chatStore.isLoading)
  const hasFetchedConversations = computed(() => chatStore.hasFetchedConversations)
  const isInitialConversationLoad = computed(
    () => chatStore.isInitialConversationLoad,
  )
  const error = computed(() => chatStore.error)
  const conversations = computed(() => chatStore.conversations)

  // ─── Pusher connection ────────────────────────────────────────────────────

  /**
   * Connect to Soketi via pusher-js and subscribe to the user's private channel.
   * Call once after login / on page load (auth-init plugin handles this).
   */
  const connectSocket = () => {
    if (!import.meta.client) return

    const token = authStore.accessToken
    const userId = profileStore.userId
    if (!token || !userId) return

    // Already subscribed for this user
    if (pusherClient && currentUserId === userId) return

    // Tear down any previous connection (e.g. user switched accounts)
    disconnectSocket()

    currentUserId = userId

    const config = useRuntimeConfig()
    const soketiKey = (config.public as any).soketiKey || 'app-key'
    const soketiHost = (config.public as any).soketiHost || '127.0.0.1'
    const soketiPort = Number((config.public as any).soketiPort || '6001')
    const soketiUseTLS = (config.public as any).soketiUseTLS === 'true'

    pusherClient = new Pusher(soketiKey, {
      cluster: 'mt1', // required by pusher-js v8 validation; overridden by wsHost below
      wsHost: soketiHost,
      wsPort: soketiUseTLS ? undefined : soketiPort,
      wssPort: soketiUseTLS ? soketiPort : undefined,
      forceTLS: soketiUseTLS,
      enabledTransports: ['ws', 'wss'],
      // Private channels need authentication — point to our auth endpoint
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    pusherClient.connection.bind('connected', () => {
      console.log('[Chat] Pusher connected to Soketi')
    })

    pusherClient.connection.bind('error', (err: any) => {
      console.error('[Chat] Pusher connection error:', err)
    })

    // Subscribe to our private channel to receive incoming messages
    const channel = pusherClient.subscribe(`private-user-${userId}`)

    channel.bind('new_message', (data: { conversationId: string; message: IMessage }) => {
      chatStore.addConversationMessage(data.conversationId, data.message)
      chatStore.bumpConversation(data.conversationId, data.message)
    })

    channel.bind('message_sent', (data: { conversationId: string; message: IMessage }) => {
      // Echo from our own message on another device/tab — skip if already added
      const existing = chatStore.getMessageById(data.message.id)
      if (!existing) {
        chatStore.addConversationMessage(data.conversationId, data.message)
      }
    })
  }

  /**
   * Disconnect Pusher when the user logs out.
   */
  const disconnectSocket = () => {
    if (pusherClient) {
      pusherClient.unbind_all()
      pusherClient.unsubscribe(`private-user-${currentUserId ?? ''}`)
      pusherClient.disconnect()
      pusherClient = null
    }
    currentUserId = null
  }

  // ─── HTTP methods (unchanged) ─────────────────────────────────────────────

  const fetchConversations = async () => {
    chatStore.setLoading(true)
    chatStore.setError(null)
    try {
      const res = await chatApi.getConversations()
      const raw: any[] = res?.data?.conversations ?? res?.conversations ?? []
      const userId = profileStore.userId ?? ''
      const normalized = raw.map((c) => normalizeConversation(c, userId))
      chatStore.setConversations(normalized)
      return normalized
    } catch (err: any) {
      chatStore.setError(
        extractErrorMessage(err, 'Failed to fetch conversations'),
      )
      throw err
    } finally {
      chatStore.setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    chatStore.setLoading(true)
    chatStore.setError(null)
    try {
      const res = await chatApi.getMessages(conversationId)
      const msgs: IMessage[] = res?.data?.messages ?? res?.messages ?? []
      chatStore.setConversationMessages(conversationId, msgs)
      return msgs
    } catch (err: any) {
      chatStore.setError(extractErrorMessage(err, 'Failed to fetch messages'))
      throw err
    } finally {
      chatStore.setLoading(false)
    }
  }

  const sendMessage = async (conversationId: string, text: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: IMessage = {
      id: tempId,
      conversationId,
      senderId: profileStore.userId ?? '',
      content: text,
      read: false,
      sentAt: new Date().toISOString(),
      status: 'sending',
    }

    // Appear in the chat immediately
    chatStore.addConversationMessage(conversationId, optimistic)
    chatStore.bumpConversation(conversationId, optimistic)

    try {
      const res = await chatApi.sendMessage(conversationId, text)
      const msg: IMessage = { ...(res?.data ?? res), status: 'sent' }
      // Swap temp message with confirmed server message (handles Pusher race too)
      chatStore.replaceMessage(conversationId, tempId, msg)
      chatStore.bumpConversation(conversationId, msg)
      return msg
    } catch (err: any) {
      chatStore.updateMessageStatus(conversationId, tempId, 'failed')
      chatStore.setError(extractErrorMessage(err, 'Failed to send message'))
      throw err
    }
  }

  const createConversation = async (targetId: string) => {
    try {
      const res = await chatApi.createConversation(targetId)
      const raw = res?.data ?? res
      const userId = profileStore.userId ?? ''
      const normalized = normalizeConversation(raw, userId)
      if (!chatStore.getConversationById(normalized.id)) {
        chatStore.addConversation(normalized)
      }
      return normalized
    } catch (err: any) {
      chatStore.setError(
        extractErrorMessage(err, 'Failed to create conversation'),
      )
      throw err
    }
  }

  const createStoreConversation = async (storeId: string, productId?: number) => {
    try {
      const res = await chatApi.createStoreConversation(storeId, productId)
      const raw = res?.data ?? res
      const userId = profileStore.userId ?? ''
      const normalized = normalizeConversation(raw, userId)
      if (!chatStore.getConversationById(normalized.id)) {
        chatStore.addConversation(normalized)
      }
      return normalized
    } catch (err: any) {
      chatStore.setError(
        extractErrorMessage(err, 'Failed to create store conversation'),
      )
      throw err
    }
  }

  return {
    isLoading,
    hasFetchedConversations,
    isInitialConversationLoad,
    error,
    conversations,
    connectSocket,
    disconnectSocket,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    createStoreConversation,
  }
}
