import type {
  IPaginationMeta,
  IProfile,
} from '../../../../layers/profile/app/types/profile.types'
import type {
  Products as ProductsModel,
  Post as PostModel,
} from '@prisma/client'
export interface IPost extends PostModel {
  author?: IProfile
  media?: Array<{
    id: string
    url: string
    type: 'IMAGE' | 'VIDEO' | 'AUDIO'
    thumbnailUrl?: string
  }> | null
  _count?: { likes: number; comments: number; shares: number }
}

export interface ICreatePostData {
  caption?: string
  content: string
  contentType?: string
  // Array of content media (images / videos)
  mediaData?: Array<{ url: string; public_id: string; type: string }>
  // Optional background music track
  musicData?: { url: string; public_id: string; type: string; name?: string }
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  allowComments?: boolean
  taggedProducts?: string[]
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: IPaginationMeta
}

export interface IProduct extends ProductsModel {
  seller?: {
    store_slug: string
    store_logo?: string | null | undefined
    store_name?: string | null | undefined
  }

  _count?: {
    likes: number
    comments: number
    shares: number
  }

  media?: Array<{
    id: string
    url: string
    type: 'IMAGE' | 'VIDEO' | 'AUDIO'
    thumbnailUrl?: string
  }>
}
