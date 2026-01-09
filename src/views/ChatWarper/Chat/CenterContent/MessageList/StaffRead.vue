<template>
  <!-- Hiển thị nhân viên đã đọc tin nhắn -->
  <div
    ref="staff_read_warper_ref"
    class="flex justify-end items-center"
  >
    <!-- Hiển thị tối đa 5 avatar -->
    <!-- Hiển thị tối đa 5 avatar -->
    <template
      v-for="(staff_read_time, staff_id, index) of conversationStore
        .select_conversation?.staff_read"
    >
      <StaffAvatar
        v-tooltip="`${getStaffName(conversationStore.select_conversation?.fb_page_id, staff_id as string)} ${$t('v1.view.main.dashboard.chat.center_content.staff_read')} ${getStaffReadDate(staff_id as string)}`"
        @click="toggleModal"
        v-if="isStaffLastReadThisMessage(staff_id as string, staff_read_time)"
        :id="(staff_id as string)"
        :class="`message-staff-read-${staff_id}`"
        class="size-4 staff-read-item rounded-full -ml-1 opacity-0 cursor-pointer -mt-1.5 relative hover:z-10 hover:border-2 hover:border-green-500 transition-opacity duration-200 hidden"
      />
    </template>
    <!-- Badge hiển thị số nhân viên còn lại nếu > 5 -->
    <!-- <span
      v-if="remaining_staff_count > 0"
      @click="toggleModal"
      v-tooltip="`+${remaining_staff_count} ${$t('nhân viên khác đã đọc')}`"
      class="staff-read-badge size-4 rounded-full -ml-1 -mt-1.5 bg-slate-500 text-white text-[8px] items-center justify-center cursor-pointer relative hover:z-10 hover:bg-slate-600 opacity-0 transition-opacity duration-200 hidden"
    >
      +{{ remaining_staff_count }}
    </span> -->
  </div>
</template>
<script setup lang="ts">
import { useConversationStore, useMessageStore } from '@/stores'
import { computed, ref } from 'vue'
import { getStaffName, getStaffReadDate } from '@/service/function'

import StaffAvatar from '@/components/Avatar/StaffAvatar.vue'

import type { ComponentRef } from '@/service/interface/vue'

const $emit = defineEmits(['change_last_read_message'])

const $props = withDefaults(
  defineProps<{
    /**thời gian của tin nhắn */
    time?: string | number
    /**thời gian của tin nhắn MỚI HƠN liền kề */
    newer_time?: string | number
  }>(),
  {}
)

const conversationStore = useConversationStore()
const messageStore = useMessageStore()

/** Số lượng avatar tối đa hiển thị */
const MAX_VISIBLE_AVATARS = 5

/**
 * Tổng số nhân viên đã đọc TIN NHẮN NÀY
 * Sử dụng cùng logic với isStaffLastReadThisMessage
 */
const total_staff_count = computed(() => {
  if (!$props.time) return 0

  const CURRENT_MESSAGE_DATE = new Date($props.time).getTime()
  const staff_read = conversationStore.select_conversation?.staff_read || {}

  // Đếm số staff đã đọc tin nhắn này (trong khoảng time của tin này)
  // Logic: staff_read_time >= current && staff_read_time < newer_time
  const NEWER_MESSAGE_DATE = $props.newer_time
    ? new Date($props.newer_time).getTime()
    : Infinity

  return Object.keys(staff_read).filter(staff_id => {
    const staff_read_time = staff_read[staff_id]
    const staff_name = getStaffName(
      conversationStore.select_conversation?.fb_page_id,
      staff_id
    )
    if (!staff_read_time || !staff_name) return false

    // Đã đọc tin này (>= time)
    const is_read_this = staff_read_time >= CURRENT_MESSAGE_DATE
    // Chưa đọc tin mới hơn (< newer_time)
    const is_not_read_newer = staff_read_time < NEWER_MESSAGE_DATE

    return is_read_this && is_not_read_newer
  }).length
})

/** Số nhân viên còn lại không hiển thị avatar */
const remaining_staff_count = computed(() => {
  const remaining = total_staff_count.value - MAX_VISIBLE_AVATARS
  return remaining > 0 ? remaining : 0
})

/**ref của div chứa staff read */
const staff_read_warper_ref = ref<ComponentRef>()

/** Ẩn hiện modal - lấy TẤT CẢ staff đã đọc tin nhắn này */
function toggleModal() {
  if (!$props.time) return

  const CURRENT_MESSAGE_DATE = new Date($props.time).getTime()
  const staff_read = conversationStore.select_conversation?.staff_read || {}

  // Lấy tất cả staff_id đã đọc tin nhắn này (không giới hạn 5)
  messageStore.select_staff_read_id = Object.keys(staff_read).filter(
    staff_id => {
      const staff_read_time = staff_read[staff_id]
      const staff_name = getStaffName(
        conversationStore.select_conversation?.fb_page_id,
        staff_id
      )
      if (!staff_read_time || !staff_name) return false

      const is_read_this = staff_read_time >= CURRENT_MESSAGE_DATE
      // function scope, tính lại
      const NEWER = $props.newer_time
        ? new Date($props.newer_time).getTime()
        : Infinity

      return is_read_this && staff_read_time < NEWER
    }
  )
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
