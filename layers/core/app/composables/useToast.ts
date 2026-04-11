export const useToast = () => {
  const { notify } = useNotification()

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000,
  ) => {
    notify({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      text: message,
      type,
      duration,
    })
  }

  return { showToast }
}
