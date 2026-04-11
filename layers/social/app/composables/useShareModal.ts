const shareState = reactive({
  isOpen: false,
  url: '',
  title: '',
})

export const useShareModal = () => {
  const openShare = (url: string, title = '') => {
    shareState.url = url
    shareState.title = title
    shareState.isOpen = true
  }
  const closeShare = () => {
    shareState.isOpen = false
  }

  return { shareState, openShare, closeShare }
}
