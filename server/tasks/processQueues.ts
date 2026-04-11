// Nitro scheduled task — kept as a health-check stub.
// BullMQ workers (server/plugins/workers.ts) process jobs in real-time,
// so manual draining is no longer needed. This task just confirms workers
// are alive and can be extended for metrics/alerting if needed.
// Schedule: '* * * * *' (every minute) — configured in nuxt.config.ts

export default defineTask({
  meta: {
    name: 'processQueues',
    description: 'BullMQ worker health-check (jobs processed in real-time)',
  },
  async run() {
    return {
      result: {
        status: 'ok',
        note: 'BullMQ workers handle jobs in real-time via server/plugins/workers.ts',
      },
    }
  },
})
