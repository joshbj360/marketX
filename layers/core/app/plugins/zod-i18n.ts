// layers/core/plugins/zod-i18n.ts
import { z } from 'zod'
import { makeZodI18nMap } from 'zod-i18n-map'

// Import standard Zod translations (or your own JSON files)
// import fr from 'zod-i18n-map/locales/fr/zod.json'

export default defineNuxtPlugin((nuxtApp) => {
  const { $i18n } = nuxtApp

  // 1. Initialize the error map
  // This tells Zod to use i18n for generating error messages
  const errorMap = makeZodI18nMap({
    t: (key, options) => $i18n.t(key, options),
    // handlePath helps with nested object errors common in enterprise forms
    handlePath: {
      context: 'context',
      ns: ['zod', 'custom'], // You can namespace your custom errors
    },
  })

  z.setErrorMap(errorMap)
})
