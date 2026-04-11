/**
 * useAudioUnlock
 *
 * Browsers block audio.play() unless it's triggered directly by a user gesture
 * (click / touchstart / keydown). IntersectionObserver callbacks are async and
 * don't satisfy that requirement, so music silently fails to start.
 *
 * This module-level composable:
 *  1. Listens for the FIRST user gesture on the page.
 *  2. On that gesture, flushes all queued play callbacks that were blocked.
 *  3. After unlock, every subsequent tryPlay() call fires immediately.
 *
 * Used by PostCard and ShopProductCard so music starts as soon as the user
 * first touches / clicks anywhere — typically within milliseconds of opening
 * the feed.
 */

import { ref } from 'vue'

// ─── Module-level shared state ────────────────────────────────────────────────
// One instance across the entire app — all card components share it.
const isUnlocked = ref(false)
const queue: Array<() => void> = []

function unlock() {
  if (isUnlocked.value) return
  isUnlocked.value = true
  // Flush queued play attempts (cards already visible before first gesture)
  const pending = queue.splice(0)
  pending.forEach((fn) => fn())
}

if (import.meta.client) {
  document.addEventListener('touchstart', unlock, { once: true, capture: true, passive: true })
  document.addEventListener('click', unlock, { once: true, capture: true })
}

// ─── Composable ───────────────────────────────────────────────────────────────
export const useAudioUnlock = () => {
  /**
   * tryPlay — attempt audio.play() now if unlocked, otherwise queue for retry.
   *
   * @param audioEl  The HTMLAudioElement to play
   * @param onPlay   Called when playback actually starts
   * @param onBlock  Called when playback is blocked (shows paused UI)
   * @returns A cancel function — call it when the card leaves the viewport so
   *          a queued retry doesn't start a card that's no longer visible.
   */
  const tryPlay = (
    audioEl: HTMLAudioElement | null,
    onPlay: () => void,
    onBlock: () => void,
  ): (() => void) => {
    if (!audioEl) return () => {}

    let cancelled = false

    const attempt = () => {
      if (cancelled || !audioEl) return
      audioEl
        .play()
        .then(() => { if (!cancelled) onPlay() })
        .catch(() => { if (!cancelled) onBlock() })
    }

    if (isUnlocked.value) {
      attempt()
    } else {
      onBlock() // Show paused state while waiting for gesture
      queue.push(attempt)
    }

    return () => { cancelled = true }
  }

  return { isUnlocked, tryPlay }
}
