import type { User } from '~~/layers/core/app/types/user'
import type { Media } from './media'

export interface Post {
  id: string
  caption: string
  content: string
  author: Partial<User>
  media: Media[]
  _count: {
    likes: number
    comments: number
  }
}
