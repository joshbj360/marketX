// FILE PATH: server/plugins/validateEnv.ts

import { validateEnvironment } from '../config/env'

/**
 * Server Plugin: Validate Environment
 * Runs on server startup and validates all required environment variables
 */

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'test') {
    validateEnvironment()
  }
})
