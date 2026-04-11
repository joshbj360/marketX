// FILE PATH: server/layers/user/repositories/chat.repository.ts

// ── Shared select shapes ─────────────────────────────────────────────────────

/** Safe Profile fields — never include password_hash or sensitive data */
const profileSelect = {
  id: true,
  username: true,
  avatar: true,
  role: true,
} as const

/** Safe SellerProfile fields for conversation headers */
const sellerSelect = {
  id: true,
  store_name: true,
  store_slug: true,
  store_logo: true,
  is_verified: true,
} as const

/** Minimal product context shown in conversation list */
const productSelect = {
  id: true,
  title: true,
  slug: true,
} as const

/** Shared conversation include — used by all conversation queries */
const conversationInclude = {
  participant1: { select: profileSelect },
  participant2: { select: profileSelect },
  seller: { select: sellerSelect },
  currentProduct: { select: productSelect },
  messages: { take: 1, orderBy: { sentAt: 'desc' as const } },
} as const

/** Shared message include */
const messageInclude = {
  sender: { select: profileSelect },
} as const

// ── Repository ───────────────────────────────────────────────────────────────

export const chatRepository = {
  // ========== CONVERSATIONS ==========

  async createConversation(data: {
    participant1Id: string
    participant2Id?: string | null
    sellerId?: string | null
    currentProductId?: number | null
  }) {
    return await prisma.conversation.create({
      data: { id: crypto.randomUUID(), ...data },
    })
  },

  async getConversationById(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: conversationInclude,
    })
  },

  async getConversationByParticipants(
    participant1Id: string,
    participant2Id: string,
  ) {
    return await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id },
        ],
      },
    })
  },

  async getConversationByBuyerAndSeller(buyerId: string, sellerId: string) {
    return await prisma.conversation.findUnique({
      where: { participant1Id_sellerId: { participant1Id: buyerId, sellerId } },
    })
  },

  async getConversationsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ) {
    return await prisma.conversation.findMany({
      where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
      include: conversationInclude,
      take: limit,
      skip: offset,
      orderBy: { lastMessageAt: 'desc' },
    })
  },

  async getConversationCountByUserId(userId: string) {
    return await prisma.conversation.count({
      where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    })
  },

  async getConversationsBySellerId(
    sellerId: string,
    limit: number,
    offset: number,
  ) {
    return await prisma.conversation.findMany({
      where: { sellerId },
      include: conversationInclude,
      take: limit,
      skip: offset,
      orderBy: { lastMessageAt: 'desc' },
    })
  },

  async getConversationCountBySellerId(sellerId: string) {
    return await prisma.conversation.count({ where: { sellerId } })
  },

  async updateConversation(
    conversationId: string,
    data: { lastMessageAt?: Date; currentProductId?: number | null },
  ) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data,
    })
  },

  async deleteConversation(conversationId: string) {
    return await prisma.conversation.delete({ where: { id: conversationId } })
  },

  // ========== MESSAGES ==========

  async createMessage(data: {
    conversationId: string
    senderId: string
    content: string
    productId?: number | null
  }) {
    return await prisma.message.create({
      data: { id: crypto.randomUUID(), ...data },
      include: messageInclude,
    })
  },

  async getMessageById(messageId: string) {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: messageInclude,
    })
  },

  async getConversationMessages(
    conversationId: string,
    limit: number,
    offset: number,
  ) {
    return await prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      take: limit,
      skip: offset,
      orderBy: { sentAt: 'asc' },
    })
  },

  async getMessageCountByConversation(conversationId: string) {
    return await prisma.message.count({ where: { conversationId } })
  },

  async deleteMessage(messageId: string) {
    return await prisma.message.delete({ where: { id: messageId } })
  },
}
