/**
 * Generate a fallback avatar URL from a username using DiceBear.
 */
export function formatAvatarUrl(username?: string | null): string {
  const seed = username ?? 'user'
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`
}
