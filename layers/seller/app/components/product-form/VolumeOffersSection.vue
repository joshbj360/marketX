<template>
  <div
    class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-neutral-100">Volume Offers</h2>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
          Reward buyers who purchase more. e.g. "Buy 3, get 10% off"
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        @click="addOffer"
      >
        <Icon name="mdi:plus" size="15" /> Add Offer
      </button>
    </div>

    <div v-if="offers.length" class="space-y-2">
      <div
        v-for="(offer, i) in offers"
        :key="i"
        class="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/10"
      >
        <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Min. Quantity *
            </label>
            <input
              v-model.number="offer.minQuantity"
              type="number"
              min="2"
              placeholder="e.g. 3"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Discount % *
            </label>
            <input
              v-model.number="offer.discount"
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 10"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Label
              <span class="font-normal opacity-60">— shown to buyer</span>
            </label>
            <input
              v-model="offer.label"
              placeholder="e.g. Bundle Deal"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span
            v-if="offer.minQuantity && offer.discount"
            class="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            Buy {{ offer.minQuantity }}+ → {{ offer.discount }}% off
          </span>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            @click="removeOffer(i)"
          >
            <Icon name="mdi:trash-can-outline" size="16" />
          </button>
        </div>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-neutral-700"
      @click="addOffer"
    >
      <Icon name="mdi:percent-outline" size="26" class="text-gray-400 dark:text-neutral-500" />
      <span class="text-sm font-medium text-gray-500 dark:text-neutral-400">
        No offers yet — add a volume deal
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  offers: Array<{ minQuantity: number | null; discount: number | null; label: string }>
}>()

const addOffer = () => {
  props.offers.push({ minQuantity: null, discount: null, label: '' })
}

const removeOffer = (i: number) => {
  props.offers.splice(i, 1)
}
</script>
