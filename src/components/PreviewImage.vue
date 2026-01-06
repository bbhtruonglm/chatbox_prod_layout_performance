<template>
  <div
    @click="close?.()"
    class="flex justify-center items-center bg-black/20 h-dvh w-dvw fixed top-0 z-[9999]"
  >
    <img
      @click.stop
      :src="image_url"
      class="max-h-[95dvh] max-w-[90dvw] object-contain"
      alt="preview_image"
    />
  </div>
</template>

<script setup lang="ts">
const $props = defineProps({
  image_url: {
    type: String,
    default: '',
  },
  close: {
    type: Function,
    default: () => {},
  },
})
</script>
