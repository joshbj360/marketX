import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        // ── MarketX design system ──────────────────────────────────────────
        // Primary: Hot Coral
        brand: {
          DEFAULT: '#F43F5E',
          light: '#FB7185',
          dark: '#E11D48',
          subtle: '#FFF1F2',
          muted: '#FECDD3',
        },

        // Secondary: Deep Navy (text, trust elements)
        navy: {
          DEFAULT: '#1E293B',
          light: '#334155',
          dark: '#0F172A',
          subtle: '#F1F5F9',
          muted: '#CBD5E1',
        },

        // Accent 1: Vibrant Violet (CTAs, highlights)
        violet: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
          subtle: '#F5F3FF',
          muted: '#DDD6FE',
        },

        // Accent 2: Soft Mint (success, confirmations)
        mint: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          subtle: '#ECFDF5',
          muted: '#A7F3D0',
        },

        // Neutral: Slate Gray (secondary text, borders)
        slate: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
          subtle: '#F8FAFC',
          muted: '#E2E8F0',
        },

        // Semantic surfaces
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        muted: {
          light: '#F1F5F9',
          dark: '#1E293B',
        },
        border: {
          light: '#E2E8F0',
          dark: '#1E293B',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        card: '16px',
        sheet: '24px',
      },

      boxShadow: {
        brand: '0 4px 24px 0 rgba(244, 63, 94, 0.22)',
        'brand-sm': '0 2px 8px 0 rgba(244, 63, 94, 0.14)',
        violet: '0 4px 24px 0 rgba(124, 58, 237, 0.20)',
      },
    },
  },
  plugins: [],
} satisfies Config
