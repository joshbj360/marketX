import { defineStore } from 'pinia'
import type { Media as MediaModel } from '@prisma/client'

export const useCoreStore = defineStore('core', {
  state: () => ({
    isLoading: false,
    isFirstMount: true,
    playVideoSound: false,

    cloudinaryUrls: [] as string[],
    mediaData: <MediaModel[]>[],
  }),
})
