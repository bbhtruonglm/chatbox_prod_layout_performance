<template>
  <Teleport
    to="body"
    v-if="is_open"
  >
    <Transition
      enter-active-class="transition ease-in-out duration-500"
      leave-active-class="transition ease-in-out duration-500"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        @click="toggleModal"
        class="absolute top-0 left-0 w-screen h-screen bg-black/10 z-20"
      >
        <div
          @click.stop
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white py-1 px-3 max-w-[95%] max-h-[95%] shadow-lg border flex flex-col gap-1"
        >
          <div
            @click="toggleModal"
            class="absolute top-2 right-2 w-6 h-6 cursor-pointer bg-slate-100 rounded-full flex justify-center items-center"
          >
            <CloseIcon class="w-3 h-3" />
          </div>
          <div class="text-sm font-semibold py-2 text-center border-b">
            {{
              $t('v1.view.main.dashboard.chat.center_content.staff_read_time')
            }}
          </div>
          <div
            class="py-2 flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-2"
          >
            <div
              v-for="staff_id of messageStore.select_staff_read_id"
              class="flex items-center gap-3"
            >
              <StaffAvatar
                :id="staff_id"
                class="rounded-oval w-11 h-11"
              />
              <div class="text-sm">
                <div class="font-semibold">
                  {{
                    getStaffName(
                      conversationStore.select_conversation?.fb_page_id,
                      staff_id
                    )
                  }}
                </div>
                <div class="text-slate-500 font-medium">
                  {{
                    $t('v1.view.main.dashboard.chat.center_content.staff_read')
                  }}
                  {{ getStaffReadDate(staff_id) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConversationStore, useMessageStore } from '@/stores'
import { getStaffReadDate, getStaffName } from '@/service/function'
import { useI18n } from 'vue-i18n'

import CloseIcon from '@/components/Icons/Close.vue'
import StaffAvatar from '@/components/Avatar/StaffAvatar.vue'

const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const $t = useI18n().t

/**ẩn hiện modal */
const is_open = ref(false)

watch(
  () => messageStore.select_staff_read_id,
  () => toggleModal()
)

/**ẩn hiện modal */
function toggleModal() {
  // toggle modal
  is_open.value = !is_open.value
}
</script>
