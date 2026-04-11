import type { IProfile } from '~~/layers/profile/app/types/profile.types'
import type { SellerProfile as SellerProfileModel } from '@prisma/client'

export interface ISellerProfile extends SellerProfileModel {
  profile?: IProfile
  media?: Array<{
    id: string
    url: string
    type: 'IMAGE' | 'VIDEO' | 'AUDIO'
  }>
  profileStats?: ISellerStats
}

export interface ISellerStats {
  followersCount: number
  followingCount: number
  postsCount: number
}
