import type { IConversation, IMessage } from '../types/profile.types'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<IConversation[]>([])
  const currentConversation = ref<IConversation | null>(null)
  const messagesByConversation = ref<Record<string, IMessage[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getConversationById = (id: string) =>
    conversations.value.find((c) => c.id === id)
  const getConversationMessages = (id: string): IMessage[] =>
    messagesByConversation.value[id] ?? []
  const getMessageById = (msgId: string): IMessage | undefined => {
    for (const msgs of Object.values(messagesByConversation.value)) {
      const found = msgs.find((m) => m.id === msgId)
      if (found) return found
    }
  }

  const setConversations = (newConversations: IConversation[]) => {
    conversations.value = newConversations
  }
  const addConversation = (conversation: IConversation) => {
    conversations.value.unshift(conversation)
  }
  const setCurrentConversation = (conversation: IConversation | null) => {
    currentConversation.value = conversation
  }
  const deleteConversation = (id: string) => {
    conversations.value = conversations.value.filter((c) => c.id !== id)
  }

  const setConversationMessages = (id: string, msgs: IMessage[]) => {
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [id]: msgs,
    }
  }
  const addConversationMessage = (id: string, msg: IMessage) => {
    const existing = messagesByConversation.value[id] ?? []
    // Deduplicate by id — prevents double-render if both HTTP response and WebSocket arrive
    if (existing.some((m) => m.id === msg.id)) return
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [id]: [...existing, msg],
    }
  }

  /** Replace a temp optimistic message (by tempId) with the confirmed server message.
   *  Also removes any duplicate with the real ID that Pusher may have delivered first. */
  const replaceMessage = (convId: string, tempId: string, msg: IMessage) => {
    const existing = messagesByConversation.value[convId] ?? []
    // Drop any already-added real message (race: Pusher arrived before HTTP response)
    const deduped = existing.filter((m) => m.id !== msg.id)
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [convId]: deduped.map((m) => (m.id === tempId ? msg : m)),
    }
  }

  /** Update the client-only status field of a message (e.g. sending → failed) */
  const updateMessageStatus = (
    convId: string,
    msgId: string,
    status: IMessage['status'],
  ) => {
    const existing = messagesByConversation.value[convId] ?? []
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [convId]: existing.map((m) => (m.id === msgId ? { ...m, status } : m)),
    }
  }

  /** Move a conversation to the top of the list and update its last message preview */
  const bumpConversation = (id: string, lastMsg: IMessage) => {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return
    const conv = {
      ...conversations.value[idx],
      created_at: lastMsg.sentAt,
    } as IConversation
    conversations.value.splice(idx, 1)
    conversations.value.unshift(conv)
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  const setError = (err: string | null) => {
    error.value = err
  }
  const clearChat = () => {
    conversations.value = []
    messagesByConversation.value = {}
    currentConversation.value = null
  }

  return {
    conversations,
    currentConversation,
    messagesByConversation,
    isLoading,
    error,
    getConversationById,
    getConversationMessages,
    getMessageById,
    bumpConversation,
    setConversations,
    addConversation,
    setCurrentConversation,
    deleteConversation,
    setConversationMessages,
    addConversationMessage,
    replaceMessage,
    updateMessageStatus,
    setLoading,
    setError,
    clearChat,
  }
})
