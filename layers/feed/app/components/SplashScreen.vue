<template>
  <div
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950"
  >
    <div class="relative flex items-center justify-center">
      <div class="absolute h-24 w-24 animate-ping rounded-full bg-brand/30" />
      <div
        class="z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-2xl shadow-brand/40"
      >
        <Icon name="mdi:shopping-outline" size="32" class="text-white" />
      </div>
    </div>

    <h1
      class="mt-6 text-lg font-black uppercase tracking-[0.25em] text-gray-900 dark:text-white"
    >
      {{ $config.public.siteName || 'MARKETX' }}
    </h1>

    <p
      class="absolute bottom-8 text-[11px] font-medium tracking-wide text-gray-400 dark:text-neutral-600"
    >
      Powered by
      <span class="font-semibold text-gray-500 dark:text-neutral-500"
        >Indices Technology</span
      >
    </p>
  </div>
</template>
