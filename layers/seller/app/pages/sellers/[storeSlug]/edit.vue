<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
await navigateTo(`/seller/${route.params.storeSlug}/settings`, {
  replace: true,
})
</script>
