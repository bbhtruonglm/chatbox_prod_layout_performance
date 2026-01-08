<template>
  <div
    v-if="type === 'MINI'"
    class="loading-spinner"
    :class="sizeClass"
    :style="customSizeStyle"
  >
    <div
      class="spinner"
      :style="customSpinnerStyle"
    ></div>
  </div>

  <div
    v-else
    class="absolute top-0 left-0 w-full h-full bg-slate-200 bg-opacity-50 flex items-center justify-center z-[9999]"
  >
    <div class="loading-spinner size-lg">
      <div class="spinner"></div>
    </div>
    <p class="text-orange-500 ml-2">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const $props = withDefaults(
  defineProps<{
    /**
     * MINI: chỉ có loading
     * FULL: phủ toàn trang
     */
    type?: 'MINI' | 'FULL'
    /** kích thước: 'sm' | 'md' | 'lg' hoặc số (px) */
    size?: 'sm' | 'md' | 'lg' | number
    text?: string
  }>(),
  {
    type: 'MINI',
    size: 'md',
  }
)

/** Class kích thước dựa trên props */
const sizeClass = computed(() => {
  // Nếu là số thì trả về rỗng (sẽ dùng inline style)
  if (typeof $props.size === 'number') return ''

  switch ($props.size) {
    case 'sm':
      return 'size-sm'
    case 'md':
      return 'size-md'
    case 'lg':
      return 'size-lg'
    default:
      return 'size-md'
  }
})

/** Inline style cho container khi size là number */
const customSizeStyle = computed(() => {
  if (typeof $props.size !== 'number') return {}
  return {}
})

/** Inline style cho spinner khi size là number */
const customSpinnerStyle = computed(() => {
  if (typeof $props.size !== 'number') return {}
  const size = $props.size
  const borderWidth = Math.max(2, Math.round(size / 8))
  return {
    width: `${size}px`,
    height: `${size}px`,
    '-webkit-mask': `radial-gradient(farthest-side, transparent calc(100% - ${borderWidth}px), #000 calc(100% - ${borderWidth}px))`,
    mask: `radial-gradient(farthest-side, transparent calc(100% - ${borderWidth}px), #000 calc(100% - ${borderWidth}px))`,
  }
})
</script>

<script lang="ts">
import { i18n } from '@/lang'

const $t = i18n.global.t

/** đặt text mặc định cho prop */
const text = $t('v1.common.loading')
</script>

<style scoped lang="scss">
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #3b82f6 0deg 270deg,
    #e2e8f0 270deg 360deg
  );
  animation: spin 0.8s linear infinite;
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    #000 calc(100% - 3px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    #000 calc(100% - 3px)
  );
}

/* Kích thước sm */
.size-sm .spinner {
  width: 16px;
  height: 16px;
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 2px),
    #000 calc(100% - 2px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 2px),
    #000 calc(100% - 2px)
  );
}

/* Kích thước md */
.size-md .spinner {
  width: 24px;
  height: 24px;
}

/* Kích thước lg */
.size-lg .spinner {
  width: 32px;
  height: 32px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
