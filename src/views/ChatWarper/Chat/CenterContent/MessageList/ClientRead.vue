<template>
  <ClientAvatar
    v-if="isClientLastReadThisMessage()"
    :conversation="conversationStore.select_conversation"
    class="message-client-read absolute -right-3.5 bottom-5 opacity-0 w-3 h-3 text-green-600 hover:z-10 hover:border-2 hover:border-green-500 rounded-full cursor-pointer transition-opacity duration-200"
    v-tooltip="
      `${conversationStore.select_conversation?.client_name} ${$t(
        'v1.view.main.dashboard.chat.center_content.staff_read'
      )} ${last_read_message}`
    "
  />
</template>
<script setup lang="ts">
import { useConversationStore } from '@/stores'
import { format } from 'date-fns'
import { computed } from 'vue'

import ClientAvatar from '@/components/Avatar/ClientAvatar.vue'

const $emit = defineEmits(['change_last_read_message'])

const $props = withDefaults(
  defineProps<{
    /**thời gian của tin nhắn */
    time?: string | number
  }>(),
  {}
)

const conversationStore = useConversationStore()

/**thời gian cuối cùng khách hàng đọc tin nhắn */
const last_read_message = computed(() => {
  /**thời gian cuối cùng khách hàng đọc tin nhắn */
  const CLIENT_LAST_READ_DATE = Number(
    conversationStore.select_conversation?.last_read_message
  )
  // nếu không có thời gian đọc thì thôi
  if (!CLIENT_LAST_READ_DATE) return ''

  return format(CLIENT_LAST_READ_DATE, 'HH:mm dd/MM/yyyy')
})

/**
 * kiểm tra xem có cho phép hiển thị avatar của khách hàng, thể hiện khách hàng
 * đã đọc đến tin nhắn này hay không
 */
function isClientLastReadThisMessage() {
  if (!conversationStore.select_conversation?.last_read_message || !$props.time)
    return false

  /**thời gian tin nhắn này được tạo */
  const CURRENT_MESSAGE_DATE = new Date($props.time).getTime()
  /**thời gian cuối cùng khách hàng đọc tin nhắn */
  const CLIENT_LAST_READ_DATE = Number(
    conversationStore.select_conversation?.last_read_message
  )

  // chỉ render icon ngoài khoảng thời gian
  if (CURRENT_MESSAGE_DATE > CLIENT_LAST_READ_DATE) return false

  // gửi sự kiện ra bên ngoài để hiển thị icon cuối cùng, các icon còn lại sẽ ẩn
  $emit('change_last_read_message')

  return true
}
</script>
