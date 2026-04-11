/**
 * useFeedSound
 *
 * Global mute/unmute state for the feed — one tap on any music pill
 * toggles sound for every card in the session (TikTok-style).
 *
 * soundEnabled starts false (silent by default).
 * First tap: unmutes → browser audio is unlocked by the direct gesture →
 *   all subsequent IntersectionObserver-triggered plays succeed automatically.
 */

import { useState } from '#imports'

/**
 * useFeedSound
 *
 * Global mute/unmute state for the feed — one tap on any music pill
 * toggles sound for every card in the session (TikTok-style).
 *
 * soundEnabled starts false (silent by default).
 * First tap: unmutes → browser audio is unlocked by the direct gesture →
 *   all subsequent IntersectionObserver-triggered plays succeed automatically.
 */
export const useFeedSound = () => {
  const soundEnabled = useState('feed-sound-enabled', () => false)
  return { soundEnabled }
}
