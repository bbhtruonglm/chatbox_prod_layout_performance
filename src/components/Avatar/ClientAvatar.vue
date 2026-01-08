<template>
  <PageAvatar
    v-if="conversation?.conversation_type === 'POST'"
    :page_info="conversationStore.getPage()"
  />

  <div
    v-else-if="image_url"
    class="overflow-hidden bg-slate-200 rounded-oval flex-shrink-0"
  >
    <img
      @error="onImageError"
      :src="image_url"
      :alt="conversation?.client_name || 'Avatar'"
      class="w-full h-full object-cover"
    />
  </div>

  <div
    v-else
    class="overflow-hidden bg-slate-200 rounded-oval flex justify-center items-center font-semibold text-white flex-shrink-0"
    :style="{ background: letterToColorCode() }"
  >
    {{ nameToLetter(conversation?.client_name || '') }}
  </div>
</template>
<script lang="ts">
/** Cache danh sách các url ảnh đã load thành công để tránh nháy skeleton */
const loaded_images = new Set<string>()
</script>
<script setup lang="ts">
import { nameToLetter } from '@/service/helper/format'
import { useConversationStore } from '@/stores'
import { Cdn, SingletonCdn, type ICdn } from '@/utils/helper/Cdn'
import { computed } from 'vue'

import PageAvatar from '@/components/Avatar/PageAvatar.vue'

import type { ConversationInfo } from '@/service/interface/app/conversation'
import type { PageType } from '@/service/interface/app/page'
import type { FacebookCommentPost } from '@/service/interface/app/post'
import { container } from 'tsyringe'

const $cdn = SingletonCdn.getInst()
/** Các nền tảng có avatar */
const NO_AVT_PLATFORMS = ['ZALO', 'TIKTOK']

const $props = withDefaults(
  defineProps<{
    /**thông tin cuộc trò chuyện */
    conversation?: ConversationInfo
    /**kích thước thực tế của hình ảnh */
    actual_size?: number
    /**dữ liệu bình luận */
    comment?: FacebookCommentPost
    /**link avt để dùng luôn */
    avatar?: string
  }>(),
  {
    actual_size: 64,
  }
)

const conversationStore = useConversationStore()

const image_url = computed(() => {
  // 1. Ưu tiên avatar truyền vào trực tiếp
  if ($props.avatar) return $props.avatar

  // 2. Avatar từ comment
  if ($props.comment) return $main.loadCommentFromAvatar()

  // 3. Avatar từ conversation
  const conv = $props.conversation
  if (!conv) return ''

  // Các nền tảng dùng CDN
  if (conv.platform_type === 'FB_MESS') return loadImageUrl()
  if (conv.platform_type === 'FB_INSTAGRAM') return loadImageUrl('FB_INSTAGRAM')
  if (conv.platform_type === 'TIKTOK') return loadImageUrl('TIKTOK')

  // Zalo hoặc các nền tảng khác có sẵn avatar
  if (conv.client_avatar) return conv.client_avatar

  return ''
})

/**tạo bg dựa trên chữ cái */
function letterToColorCode() {
  let character = $props.conversation?.client_name

  // nếu không có tên thì trả về màu mặc định
  if (!character) return 'rgb(212, 219, 255)'

  // lấy chữ cái đầu tiên và Chuyển ký tự thành chữ thường
  const INPUT = character?.charAt(0).toLowerCase()

  // Chuyển đổi ký tự thành mã màu, Lấy mã Unicode và trừ đi mã 'a' (97)
  let charCode = (INPUT?.charCodeAt(0) || 0) - 97

  // Chuyển đổi số nguyên thành giá trị RGB
  var red = (charCode * 30) % 256
  var green = (charCode * 20) % 256
  var blue = (charCode * 10) % 256

  return 'rgb(' + red + ', ' + green + ', ' + blue + ')'
}
/**tạo url ảnh */
function loadImageUrl(platform_type?: PageType) {
  const PARAMS = `?width=${$props.actual_size * 2}&height=${
    $props.actual_size * 2
  }`

  if (platform_type === 'FB_INSTAGRAM')
    return (
      $cdn.igClientAvt(
        $props.conversation?.fb_page_id,
        $props.conversation?.fb_client_id
      ) +
      '.png' +
      PARAMS
    )
  if (platform_type === 'TIKTOK') {
    return (
      $cdn.tiktokClientAvt(
        $props.conversation?.fb_page_id,
        $props.conversation?.fb_client_id
      ) +
      '.png' +
      PARAMS
    )
  }
  return (
    $cdn.fbClientAvt(
      $props.conversation?.fb_page_id,
      $props.conversation?.fb_client_id
    ) +
    '.png' +
    PARAMS
  )
}
/**khi ảnh load thất bại thì thay thế ảnh mặc định vào */
function onImageError($event: Event) {
  const image = $event.target as HTMLImageElement

  image.src = `${$env.img_host}/1111111111?width=${
    $props.actual_size * 2
  }&height=${$props.actual_size * 2}`
}

class Main {
  /**
   * @param SERVICE_CDN dịch vụ cdn
   */
  constructor(private readonly SERVICE_CDN: ICdn = container.resolve(Cdn)) {}

  /**lấy avt của người gửi của bình luận này */
  loadCommentFromAvatar() {
    // nếu không có bình luận thì trả về rỗng
    if (!$props.comment) return ''

    /**id trang */
    const PAGE_ID = $props.conversation?.fb_page_id
    /**id người gửi */
    const FROM_ID = $props.comment?.from?.id

    // trả về url ảnh
    return (
      this.SERVICE_CDN.fbClientAvt(PAGE_ID, FROM_ID) +
      `.png?width=${$props.actual_size * 2}&height=${$props.actual_size * 2}`
    )
  }
}
const $main = new Main()
</script>
