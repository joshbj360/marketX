import type { User } from '~~/layers/core/app/types/user'

export interface ProductComment {
  id: string
  text: string
  user: Partial<User>
  createdAt: string
  replies: ProductComment[]
}
