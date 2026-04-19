export default defineNuxtConfig({
  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
    },
  ],
  modules: ['@pinia/nuxt'],
})
