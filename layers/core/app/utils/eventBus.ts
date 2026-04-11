import mitt, { type Emitter } from 'mitt'

export type ApplicationEvents = {
  // Auth events
  'auth:login': { userId: string; timestamp: number }
  'auth:logout': { timestamp: number }
  'auth:profile-updated': { userId: string }

  // Cart events
  'cart:updated': { itemCount: number }
  'cart:item-added': { productId: number }

  // Order events
  'order:created': { orderId: number }
  'order:completed': { orderId: number }
}

class TypedEventBus {
  private emitter: Emitter<ApplicationEvents>

  constructor() {
    this.emitter = mitt<ApplicationEvents>()
  }

  on<K extends keyof ApplicationEvents>(
    event: K,
    handler: (data: ApplicationEvents[K]) => void,
  ) {
    this.emitter.on(event, handler)
  }

  off<K extends keyof ApplicationEvents>(
    event: K,
    handler: (data: ApplicationEvents[K]) => void,
  ) {
    this.emitter.off(event, handler)
  }

  emit<K extends keyof ApplicationEvents>(
    event: K,
    data: ApplicationEvents[K],
  ) {
    this.emitter.emit(event, data)
  }
}

export const eventBus = new TypedEventBus()
