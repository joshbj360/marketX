<template>
  <div class="password-strength-meter">
    <!-- Meter Bar -->
    <div class="meter">
      <div
        class="meter-fill"
        :class="`strength-${strength}`"
        :style="{ width: `${strengthPercentage}%` }"
      ></div>
    </div>

    <!-- Strength Label -->
    <div class="strength-label" :class="`label-${strength}`">
      {{ strengthText }}
    </div>

    <!-- Requirements Checklist -->
    <div class="requirements">
      <div class="requirement" :class="{ met: checks.length }">
        <span class="icon">{{ checks.length ? '✓' : '✕' }}</span>
        <span>At least 12 characters</span>
      </div>

      <div class="requirement" :class="{ met: checks.uppercase }">
        <span class="icon">{{ checks.uppercase ? '✓' : '✕' }}</span>
        <span>Contains uppercase letter (A-Z)</span>
      </div>

      <div class="requirement" :class="{ met: checks.lowercase }">
        <span class="icon">{{ checks.lowercase ? '✓' : '✕' }}</span>
        <span>Contains lowercase letter (a-z)</span>
      </div>

      <div class="requirement" :class="{ met: checks.number }">
        <span class="icon">{{ checks.number ? '✓' : '✕' }}</span>
        <span>Contains number (0-9)</span>
      </div>

      <div class="requirement" :class="{ met: checks.special }">
        <span class="icon">{{ checks.special ? '✓' : '✕' }}</span>
        <span>Contains special character (!@#$%^&*)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  password: string
}

const props = withDefaults(defineProps<Props>(), {
  password: '',
})

// Check password requirements
const checks = computed(() => ({
  length: props.password.length >= 12,
  uppercase: /[A-Z]/.test(props.password),
  lowercase: /[a-z]/.test(props.password),
  number: /[0-9]/.test(props.password),
  special: /[!@#$%^&*]/.test(props.password),
}))

// Calculate strength
const metRequirements = computed(() => {
  return Object.values(checks.value).filter(Boolean).length
})

const strength = computed(() => {
  const met = metRequirements.value

  if (met === 0) return 'none'
  if (met <= 1) return 'weak'
  if (met <= 2) return 'fair'
  if (met <= 3) return 'good'
  if (met <= 4) return 'strong'
  return 'very-strong'
})

const strengthPercentage = computed(() => {
  return (metRequirements.value / 5) * 100
})

const strengthText = computed(() => {
  const textMap = {
    none: 'No password',
    weak: 'Weak password',
    fair: 'Fair password',
    good: 'Good password',
    strong: 'Strong password',
    'very-strong': 'Very strong password',
  }

  return textMap[strength.value as keyof typeof textMap]
})
</script>

<style scoped>
.password-strength-meter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.meter {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.meter-fill.strength-none {
  background: transparent;
  width: 0 !important;
}

.meter-fill.strength-weak {
  background: #ef4444;
}

.meter-fill.strength-fair {
  background: #f59e0b;
}

.meter-fill.strength-good {
  background: #3b82f6;
}

.meter-fill.strength-strong {
  background: #10b981;
}

.meter-fill.strength-very-strong {
  background: #059669;
}

.strength-label {
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s;
}

.strength-label.label-none {
  color: #9ca3af;
}

.strength-label.label-weak {
  color: #ef4444;
}

.strength-label.label-fair {
  color: #f59e0b;
}

.strength-label.label-good {
  color: #3b82f6;
}

.strength-label.label-strong {
  color: #10b981;
}

.strength-label.label-very-strong {
  color: #059669;
}

.requirements {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
}

:global(.dark) .requirements {
  background: rgba(255, 255, 255, 0.04);
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
  transition: color 0.2s;
}

.requirement.met {
  color: #10b981;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.25rem;
}

.requirement:not(.met) .icon {
  color: #d1d5db;
}

.requirement.met .icon {
  color: #10b981;
}
</style>
