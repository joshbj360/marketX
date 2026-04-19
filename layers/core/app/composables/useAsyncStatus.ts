export const useAsyncStatus = () => {
  const isLoading = ref(false)
  const hasFetchedOnce = ref(false)

  const begin = () => {
    isLoading.value = true
  }

  const end = () => {
    isLoading.value = false
    hasFetchedOnce.value = true
  }

  const reset = () => {
    isLoading.value = false
    hasFetchedOnce.value = false
  }

  const isInitialLoad = computed(
    () => isLoading.value || !hasFetchedOnce.value,
  )

  return {
    isLoading,
    hasFetchedOnce,
    isInitialLoad,
    begin,
    end,
    reset,
  }
}
