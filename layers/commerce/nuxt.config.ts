export default defineNuxtConfig({
  components: [{ path: '~/components', pathPrefix: false }],
  imports: {
    dirs: ['composables', 'stores', 'utils'],
  },
})
