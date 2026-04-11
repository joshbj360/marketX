export const useStoryStore = defineStore('story', () => {
  const stories = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const setStories = (s: any[]) => {
    stories.value = s
  }
  const addStory = (s: any) => {
    stories.value.unshift(s)
  }
  const removeStory = (id: string) => {
    stories.value = stories.value.filter((s) => s.id !== id)
  }

  return {
    stories,
    isLoading,
    error,
    setStories,
    addStory,
    removeStory,
    setLoading: (val: boolean) => {
      isLoading.value = val
    },
    setError: (val: string | null) => {
      error.value = val
    },
  }
})
