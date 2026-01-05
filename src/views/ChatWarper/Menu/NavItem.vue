<template>
  <button
    :aria-label="title"
    v-tooltip.right="title"
    :tooltip-disabled="is_disable_tooltip"
    :class="{
      'bg-slate-300': is_active,
    }"
    class="rounded-lg hover:bg-slate-300 p-2.5"
  >
    <component
      :is="icon"
      :class="class_icon"
      class="w-6 h-6 m-auto"
    />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    /**icon */
    icon: Component
    /** tiêu đề */
    title: string
    /** đang chọn ? */
    is_active?: boolean
    /**có huỷ bỏ tooltip không */
    is_disable_tooltip?: boolean
    /**class thêm cho icon */
    class_icon?: string
  }>(),
  {
    class_icon: 'text-slate-900',
  }
)
</script>
