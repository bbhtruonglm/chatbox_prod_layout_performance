<template>
  <!-- Hiển thị nhân viên đã đọc tin nhắn -->
  <div
    ref="staff_read_warper_ref"
    class="flex justify-end"
  >
    <template
      v-for="(staff_read_time, staff_id) of conversationStore
        .select_conversation?.staff_read"
    >
      <StaffAvatar
        v-tooltip="`${getStaffName(conversationStore.select_conversation?.fb_page_id, staff_id as string)} ${$t('v1.view.main.dashboard.chat.center_content.staff_read')} ${getStaffReadDate(staff_id as string)}`"
        @click="toggleModal"
        v-if="isStaffLastReadThisMessage(staff_id as string, staff_read_time)"
        :id="(staff_id as string)"
        :class="`message-staff-read-${staff_id}`"
        class="w-4 h-4 staff-read-item rounded-full -ml-1 invisible mt-1 cursor-pointer relative hover:z-10 hover:border-2 hover:border-green-500"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { useConversationStore, useMessageStore } from '@/stores'
import { ref } from 'vue'
import { getStaffName, getStaffReadDate } from '@/service/function'

import StaffAvatar from '@/components/Avatar/StaffAvatar.vue'

import type { ComponentRef } from '@/service/interface/vue'

const $emit = defineEmits(['change_last_read_message'])

const $props = withDefaults(
  defineProps<{
    /**thời gian của tin nhắn */
    time?: string | number
  }>(),
  {}
)

const conversationStore = useConversationStore()
const messageStore = useMessageStore()

/**ref của div chứa staff read */
const staff_read_warper_ref = ref<ComponentRef>()

/** Ẩn hiện modal */
function toggleModal() {
  /**danh sách các staff read */
  const STAFF_READ_ITEM_HTML: HTMLDivElement[] =
    staff_read_warper_ref.value?.getElementsByClassName('staff-read-item')

  // lấy danh sách id thoả mãn
  messageStore.select_staff_read_id = Array.from(STAFF_READ_ITEM_HTML)
    // lọc ra các div đang hiển thị
    ?.filter(staff_read => staff_read?.style?.display === 'block')
    // lấy id_staff từ id của div
    ?.map(staff_read => staff_read?.id?.substring(16))
}
/**kiểm tra xem nhân viên có đọc đến tin nhắn này hay không */
function isStaffLastReadThisMessage(
  staff_id?: string,
  staff_read_time?: number
) {
  if (!staff_read_time || !$props.time) return false

  /**thời gian tin nhắn này được tạo */
  const CURRENT_MESSAGE_DATE = new Date($props.time).getTime()

  // chỉ render icon ngoài khoảng thời gian
  if (CURRENT_MESSAGE_DATE > staff_read_time) return false

  // gửi sự kiện ra bên ngoài để hiển thị icon cuối cùng, các icon còn lại sẽ ẩn
  $emit('change_last_read_message', staff_id)

  return true
}

defineExpose({ toggleModal })
</script>
