import { st } from 'vue-router/dist/router-CWoNjPRp.mjs'

/**
 * Extract initials from a name string
 * @param {string} name - The full name (e.g., "John Doe", "Jane", "John Michael Doe")
 * @param {number} maxInitials - Maximum number of initials to return (default: 2)
 * @returns {string} - Uppercase initials
 */
function getInitials(name: string, maxInitials = 2) {
  if (!name || typeof name !== 'string') return '?'

  // Trim whitespace and split by spaces
  const words = name.trim().split(/\s+/)

  // Handle empty string after trimming
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return '?'

  // Get first letter of each word, filter out empty strings, take first 'maxInitials' letters
  return words
    .map((word) => word.charAt(0))
    .filter((letter) => letter && letter.match(/[a-zA-Z]/)) // Only keep letters
    .slice(0, maxInitials)
    .join('')
    .toUpperCase()
}
