<template>
  <!-- Spinner nhỏ gọn dùng cho load more -->
  <div
    class="loading-spinner"
    :class="sizeClass"
  >
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Props cho component */
interface IProps {
  /** Kích thước: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg'
}

const $props = withDefaults(defineProps<IProps>(), {
  size: 'sm',
})

/** Class kích thước dựa trên props */
const sizeClass = computed(() => {
  switch ($props.size) {
    case 'sm':
      return 'size-sm'
    case 'md':
      return 'size-md'
    case 'lg':
      return 'size-lg'
    default:
      return 'size-sm'
  }
})
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
