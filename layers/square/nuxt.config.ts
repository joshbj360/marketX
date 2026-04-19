export default defineNuxtConfig({
  // Square layer — Market Square community feature
  // Server routes in server/api/squares/, UI pages in app/pages/squares/
  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
    },
  ],
})
