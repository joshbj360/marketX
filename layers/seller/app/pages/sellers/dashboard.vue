<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo('/seller/dashboard', { replace: true })
</script>
