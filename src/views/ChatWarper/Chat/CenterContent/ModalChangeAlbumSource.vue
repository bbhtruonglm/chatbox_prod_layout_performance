<template>
  <Modal
    ref="modal_change_quick_answer_ref"
    class_modal="w-[500px] h-fit max-h-[70dvh]"
    class_body="!overflow-hidden bg-white p-3 flex flex-col rounded-md gap-2"
  >
    <template #header>
      {{ $t('Chọn trang lấy album') }}
    </template>

    <template #body>
      <!-- 🟦 Hiển thị tổng số trang đã chọn -->
      <div
        v-if="selectedPages.length"
        class="flex items-center justify-between text-sm border p-2 rounded-md bg-gray-50"
      >
        <span class="font-medium"> {{ $t('Số trang đã chọn') }}: </span>
        <span class="text-blue-600 font-semibold">
          {{ selectedPages.length }}
        </span>
      </div>

      <!-- Ô tìm kiếm -->
      <input
        v-model="search"
        type="text"
        :placeholder="$t('Tìm kiếm')"
        class="w-full outline-none border py-2 px-3 rounded-md h-full"
      />

      <div class="flex gap-2">
        <!-- 🔹 Nút chọn tất cả -->
        <button
          class="flex-1 py-2 px-3 rounded-md bg-green-100 text-green-700 font-medium w-full border border-green-700"
          @click="selectAllPages"
        >
          {{ $t('Chọn tất cả các trang') }}
        </button>

        <!-- 🔹 Nút bỏ chọn tất cả -->
        <!-- <button
          class="flex-1 py-2 px-3 rounded-md bg-red-50 text-red-700 font-medium w-full border border-red-700"
          @click="clearAllPages"
        >
          {{ $t('Bỏ chọn tất cả') }}
        </button> -->
        <!-- Nút khôi phục trang mặc định -->
        <!-- v-if="!is_default_selection" -->
        <button
          class="flex-1 py-2 px-3 rounded-md bg-blue-100 text-blue-700 font-medium w-full border border-blue-700"
          @click="selectDefaultPage"
          :disabled="is_default_selection"
        >
          {{ $t('Khôi phục mặc định') }}
        </button>
      </div>

      <!-- Danh sách các trang -->
      <ul class="flex flex-col h-full gap-2 overflow-auto">
        <li
          v-for="item in orgStore.list_os"
          :key="item?.page_id"
          class="py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex gap-2 items-center"
          v-show="showPage(item?.page_info)"
          @click="togglePage(item?.page_id || '')"
        >
          <PageAvatar
            :page_info="item?.page_info"
            class="w-8 h-8 flex-shrink-0"
          />
          <div class="w-full flex justify-between items-center">
            <div>
              <p class="font-medium">
                {{ item?.page_info?.name }}
              </p>
              <p class="text-slate-400 text-xs">
                {{ item?.page_id }}
              </p>
            </div>

            <!-- ✅ Hiển thị icon nếu đã chọn (dùng local_page_ids) -->
            <CheckCircleIcon
              v-if="item?.page_id && local_page_ids.includes(item.page_id)"
              class="size-5 text-blue-500"
            />
          </div>
        </li>
      </ul>

      <div class="flex gap-2 mt-2">
        <!-- Hủy (không emit) -->
        <button
          class="flex-1 py-2 px-3 rounded-md bg-gray-100 text-gray-800 font-medium border"
          @click="cancelSelection"
        >
          {{ $t('Hủy') }}
        </button>

        <!-- ✅ Xác nhận (mới emit ra ngoài) -->
        <button
          class="flex-1 py-2 px-3 rounded-md bg-blue-600 text-white font-medium"
          @click="confirmSelection"
        >
          {{ $t('Xác nhận lựa chọn') }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { nonAccentVn } from '@/service/helper/format'
import { useConversationStore, useOrgStore } from '@/stores'
import { isEmpty } from 'lodash'
import { computed, ref, watch, type PropType } from 'vue'

import PageAvatar from '@/components/Avatar/PageAvatar.vue'
import Modal from '@/components/Modal.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { IPage } from '@/service/interface/app/page'

/** store */
const orgStore = useOrgStore()
const conversationStore = useConversationStore()

/** emits */
const emit = defineEmits<{
  (e: 'update:page_ids', value: string[]): void
}>()

/** Mảng id các trang (v-model prop) */
const page_ids = defineModel('page_ids', {
  type: Array as PropType<string[]>,
  default: () => [],
})

/** LOCAL copy của page_ids để thao tác trong modal (chỉ commit khi confirm) */
const local_page_ids = ref<string[]>([...(page_ids.value || [])])

/** modal ref */
const modal_change_quick_answer_ref = ref<InstanceType<typeof Modal> | null>(
  null
)

/** từ khóa tìm kiếm */
const search = ref('')

/** Khi prop page_ids thay đổi từ cha (ngoài modal), cập nhật local nếu modal đang đóng.
    Để đơn giản, ta luôn cập nhật local nếu parent thay đổi (không ghi đè khi user đang edit vì modal copy khi mở). */
watch(
  () => page_ids.value,
  v => {
    console.log(v, 'vvvvv')
    // If parent changes externally and modal not open (or any time), sync local
    // We intentionally do not watch modal open state here to keep logic simple.
    local_page_ids.value = [...(v || [])]
  }
)

/** kiểm tra khôi phục mặc định (dựa trên local copy) */
const is_default_selection = computed(() => {
  const DEFAULT_ID = conversationStore.select_conversation?.fb_page_id || ''
  return (
    local_page_ids.value.length === 1 &&
    local_page_ids.value.includes(DEFAULT_ID)
  )
})

/** 🟦 Danh sách page đã chọn (đầy đủ thông tin) - từ local_page_ids */
const selectedPages = computed<IPage[]>(() => {
  return (
    orgStore.list_os
      ?.filter(
        item => item?.page_id && local_page_ids.value.includes(item.page_id)
      )
      .map(item => item.page_info)
      .filter((page): page is IPage => !!page) || []
  )
})

/** hiển thị page nếu khớp từ khóa */
function showPage(page_info: IPage = {}) {
  if (isEmpty(page_info)) return false
  const PAGE_NAME = nonAccentVn(page_info?.name || '').replace(/ /g, '')
  const KEY_WORD = nonAccentVn(search.value).replace(/ /g, '')
  const PAGE_ID = nonAccentVn(page_info?.fb_page_id || '').replace(/ /g, '')
  return PAGE_NAME.includes(KEY_WORD) || PAGE_ID.includes(KEY_WORD)
}

/** Chọn / bỏ chọn 1 page -> chỉ thay đổi local */
function togglePage(id: string) {
  if (!id) return
  const IDX = local_page_ids.value.indexOf(id)
  if (IDX !== -1) local_page_ids.value.splice(IDX, 1)
  else local_page_ids.value.push(id)
}

/** Chọn tất cả page -> chỉ thay đổi local */
function selectAllPages() {
  if (orgStore.list_os) {
    local_page_ids.value = orgStore.list_os
      .map(item => item.page_id)
      .filter((id): id is string => typeof id === 'string')
  }
}

/** Bỏ chọn tất cả -> chỉ thay đổi local */
function clearAllPages() {
  local_page_ids.value = []
}

/** Khôi phục trang mặc định -> chỉ thay đổi local */
function selectDefaultPage() {
  const DEFAULT_ID = conversationStore.select_conversation?.fb_page_id || ''
  local_page_ids.value = [DEFAULT_ID]
}

/** Hủy (đóng modal, không emit) */
function cancelSelection() {
  // reset local to prop (discard changes) then close modal
  local_page_ids.value = [...(page_ids.value || [])]
  modal_change_quick_answer_ref.value?.toggleModal()
}

/** ✅ Xác nhận lựa chọn — emit ra ngoài và đóng modal */
function confirmSelection() {
  const DEFAULT_ID = conversationStore.select_conversation?.fb_page_id || ''

  // 🟦 Nếu chưa chọn trang nào → auto chọn trang mặc định
  if (!local_page_ids.value.length && DEFAULT_ID) {
    local_page_ids.value = [DEFAULT_ID]
  }

  emit('update:page_ids', [...local_page_ids.value])
  modal_change_quick_answer_ref.value?.toggleModal()
}

/** Expose toggle modal — mỗi lần mở modal ta sync local từ prop */
defineExpose({
  toggleModal() {
    // sync local from parent prop when opening the modal (so user edits start from current value)
    local_page_ids.value = [...(page_ids.value || [])]
    modal_change_quick_answer_ref.value?.toggleModal()
  },
})
</script>
