import { onMounted, onUnmounted } from 'vue'
import { useRouter } from '#imports'

/**
 * Adds a horizontal swipe gesture to a page for Feed ↔ Reels navigation.
 *
 * @param direction  'left'  → navigate to `to` when user swipes left
 *                   'right' → navigate to `to` when user swipes right
 * @param to         Route to push on swipe
 * @param threshold  Minimum horizontal px before the swipe registers (default 60)
 */
export const useSwipeNav = (
  direction: 'left' | 'right',
  to: string,
  threshold = 60,
) => {
  const router = useRouter()

  let startX = 0
  let startY = 0
  let tracking = false

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]!
    startX = t.clientX
    startY = t.clientY
    tracking = true
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!tracking) return
    tracking = false

    const t = e.changedTouches[0]!
    const dx = t.clientX - startX
    const dy = t.clientY - startY

    // Ignore predominantly vertical swipes (scrolling)
    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) < threshold) return

    const swipedLeft = dx < 0
    if (direction === 'left' && swipedLeft) router.push(to)
    if (direction === 'right' && !swipedLeft) router.push(to)
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
  })
}
