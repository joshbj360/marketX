<!-- pages/index.vue — auth-aware entry point -->
<!-- Authenticated  → personalised social feed  (SocialFeed) -->
<!-- Unauthenticated → commerce-first market home (MarketHome) -->
<template>
  <!-- No narrow-feed prop — HomeLayout defaults to narrow for the index route -->
  <HomeLayout>
    <ClientOnly>
      <Transition name="feed-swap" mode="out-in">
        <SocialFeed v-if="profileStore.isLoggedIn" key="social" />
        <MarketHome v-else key="market" @sign-in="router.push('/user-login')" />
      </Transition>
      <!-- Fallback shown during SSR/hydration — render MarketHome so page isn't blank on first paint -->
      <template #fallback>
        <MarketHome @sign-in="router.push('/user-login')" />
      </template>
    </ClientOnly>

    <template v-if="profileStore.isLoggedIn" #right-sidebar>
      <RightSideNav />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'

import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import SocialFeed from '~~/layers/feed/app/components/SocialFeed.vue'
import MarketHome from '~~/layers/feed/app/components/MarketHome.vue'
import RightSideNav from '~~/layers/core/app/layouts/children/RightSideNav.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSeo } from '~~/layers/core/app/composables/useSeo'

const router = useRouter()
const profileStore = useProfileStore()

useSeo().setHomePage()
</script>

<style>
.feed-swap-enter-active,
.feed-swap-leave-active {
  transition: opacity 0.2s ease;
}
.feed-swap-enter-from,
.feed-swap-leave-to {
  opacity: 0;
}
</style>
