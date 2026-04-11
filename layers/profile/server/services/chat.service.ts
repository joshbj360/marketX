// FILE PATH: server/layers/user/services/chat.service.ts

/**
 * Chat Service
 * Handles: Conversations and Messages (User-to-User, User-to-Seller, User-to-AI)
 */

import { UserError } from '../types/user.types'
import { chatRepository } from '../repositories/chat.repository'
import { profileRepository } from '../repositories/profile.repository'
import { triggerUserEvent } from '~~/server/utils/pusher'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { IConversation } from '../../app/types/profile.types'

export const chatService = {
  // ==================== CONVERSATIONS ====================

  async createConversation(
    userId: string,
    targetId: string,
    productId?: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Check for existing conversation
    const existing = await chatRepository.getConversationByParticipants(
      userId,
      targetId,
    )
    if (existing) return existing

    // 2. Create new conversation
    const conversation = await chatRepository.createConversation({
      participant1Id: userId,
      participant2Id: targetId,
      currentProductId: productId,
    })

    // ALIGNED: Audit Log
    if (ipAddress && userAgent) {
      auditQueue.enqueue({
        userId,
        action: 'CONVERSATION_STARTED',
        resource: 'Conversation',
        resourceId: conversation.id,
        reason: 'User started a new chat',
        changes: { targetId, productId },
        ipAddress,
        userAgent,
      })
    }

    return conversation
  },

  // ── Store conversation (buyer → store) ────────────────────────────────────
  async createStoreConversation(
    buyerId: string,
    sellerId: string,
    productId?: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Return existing conversation if one already exists
    const existing = await chatRepository.getConversationByBuyerAndSeller(
      buyerId,
      sellerId,
    )
    if (existing) return existing

    const conversation = await chatRepository.createConversation({
      participant1Id: buyerId,
      sellerId,
      currentProductId: productId,
    })

    if (ipAddress && userAgent) {
      auditQueue.enqueue({
        userId: buyerId,
        action: 'STORE_CONVERSATION_STARTED',
        resource: 'Conversation',
        resourceId: conversation.id,
        reason: 'Buyer started a chat with a store',
        changes: { sellerId, productId },
        ipAddress,
        userAgent,
      })
    }

    return conversation
  },

  async getStoreConversations(sellerId: string, limit = 20, offset = 0) {
    const conversations = await chatRepository.getConversationsBySellerId(
      sellerId,
      limit,
      offset,
    )
    const total = await chatRepository.getConversationCountBySellerId(sellerId)
    return { conversations, total, limit, offset }
  },

  async getConversations(userId: string, limit = 20, offset = 0) {
    const conversations = await chatRepository.getConversationsByUserId(
      userId,
      limit,
      offset,
    )
    const total = await chatRepository.getConversationCountByUserId(userId)
    return { conversations, total, limit, offset }
  },

  async getConversation(conversationId: string, userId: string) {
    const conversation =
      await chatRepository.getConversationById(conversationId)
    if (!conversation)
      throw new UserError(
        'CONVERSATION_NOT_FOUND',
        'Conversation not found',
        404,
      )

    // Security: buyer, the other user, OR the store owner can view
    const isParticipant =
      conversation.participant1Id === userId ||
      conversation.participant2Id === userId ||
      (conversation as unknown).seller?.profileId === userId
    if (!isParticipant) {
      throw new UserError('FORBIDDEN', 'Access denied', 403)
    }

    return conversation
  },

  async updateConversationProduct(
    conversationId: string,
    userId: string,
    productId: number,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.getConversation(conversationId, userId) // Checks existence and permission

    const updated = await chatRepository.updateConversation(conversationId, {
      currentProductId: productId,
    })

    // ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'CONVERSATION_PRODUCT_UPDATED',
      resource: 'Conversation',
      resourceId: conversationId,
      reason: 'Product focus in chat updated',
      changes: { productId },
      ipAddress,
      userAgent,
    })

    return updated
  },

  async deleteConversation(
    conversationId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.getConversation(conversationId, userId) // Checks existence and permission

    await chatRepository.deleteConversation(conversationId)

    // ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'CONVERSATION_DELETED',
      resource: 'Conversation',
      resourceId: conversationId,
      reason: 'User deleted their copy of the conversation',
      ipAddress,
      userAgent,
    })

    return { message: 'Conversation deleted successfully' }
  },

  // ==================== MESSAGES ====================

  async sendMessage(
    conversationId: string,
    userId: string,
    text: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const conversation = await this.getConversation(conversationId, userId)

    // 1. Create message
    const message = await chatRepository.createMessage({
      conversationId,
      senderId: userId,
      content: text,
    })

    // 2. Update conversation timestamp (Brings chat to top of list)
    await chatRepository.updateConversation(conversationId, {
      lastMessageAt: new Date(),
    })

    // 3. ALIGNED: Audit Log
    if (ipAddress && userAgent) {
      auditQueue.enqueue({
        userId,
        action: 'MESSAGE_SENT',
        resource: 'Message',
        resourceId: message.id,
        reason: 'User sent a chat message',
        ipAddress,
        userAgent,
      })
    }

    // 4. Real-time delivery via Soketi
    //    For store conversations: recipient is the store owner (seller.userId)
    //    For user conversations: recipient is the other participant
    let recipientId: string | null = null
    const conv = conversation as IConversation

    if (conv.sellerId) {
      // Store conversation — push to store owner if they're not the sender
      const storeOwnerUserId = conv.seller?.profileId
      if (storeOwnerUserId && storeOwnerUserId !== userId) {
        recipientId = storeOwnerUserId
      } else if (storeOwnerUserId === userId) {
        // Owner is replying → push to the buyer
        recipientId = conv.participant1Id
      }
    } else {
      recipientId =
        conv.participant1Id === userId
          ? conv.participant2Id
          : conv.participant1Id
    }

    if (recipientId) {
      await triggerUserEvent(recipientId, 'new_message', {
        conversationId,
        message,
      })
    }

    // Also echo back to the sender (other tabs / devices)
    await triggerUserEvent(userId, 'message_sent', {
      conversationId,
      message,
    })

    // 5. ALIGNED: Notification
    if (recipientId !== 'ai-bot') {
      const sender = await profileRepository.findById(userId)

      notificationQueue.enqueue({
        userId: recipientId as string,
        type: 'MESSAGE',
        actorId: userId,
        message: `New message from ${sender?.username || 'someone'}`,
        conversationId, // Important for frontend deep-linking
      })
    }

    return message
  },

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    await this.getConversation(conversationId, userId) // Verify access

    const messages = await chatRepository.getConversationMessages(
      conversationId,
      limit,
      offset,
    )
    const total =
      await chatRepository.getMessageCountByConversation(conversationId)
    return { messages, total, limit, offset }
  },

  async deleteMessage(
    messageId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const message = await chatRepository.getMessageById(messageId)
    if (!message)
      throw new UserError('MESSAGE_NOT_FOUND', 'Message not found', 404)

    if (message.senderId !== userId) {
      throw new UserError(
        'FORBIDDEN',
        'You can only delete your own messages',
        403,
      )
    }

    await chatRepository.deleteMessage(messageId)

    // ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'MESSAGE_DELETED',
      resource: 'Message',
      resourceId: messageId,
      reason: 'User deleted a sent message',
      ipAddress,
      userAgent,
    })

    return { message: 'Message deleted successfully' }
  },
}
