<template>
  <Modal
    class_modal="w-[300px] text-sm"
    class_footer="grid grid-cols-2 gap-2 font-medium"
    ref="choose_time_disable_modal_ref"
  >
    <template v-slot:header> {{ $t('Thời gian tắt AI') }} </template>
    <template v-slot:body>
      <ul class="bg-white p-2 rounded-lg">
        <li
          class="py-1.5 px-2 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-2"
          @click="$main.disableChatbot(FOREVER)"
        >
          {{ $t('Tắt đến khi bật lại') }}
        </li>
        <li
          v-for="item in 5"
          class="py-1.5 px-2 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-2"
          @click="$main.disableChatbot(item * ONE_HOUR)"
        >
          {{ $t('Tắt trong _ giờ', { hour: item }) }}
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { toastError } from '@/service/helper/alert';
import { error } from '@/utils/decorator/Error';
import { composableService } from '@/views/ChatWarper/Chat/CenterContent/UserInfo/ChatbotStatus/service';
import { ref } from 'vue';

import Modal from '@/components/Modal.vue';

/** thời gian vĩnh viễn ~ 9999 năm */
const FOREVER = 9999 * 365 * 24 * 60 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000

const { manageChatbot } = composableService(true)

/** ref modal */
const choose_time_disable_modal_ref = ref<InstanceType<typeof Modal>>()

class Main {
  /** tắt chatbot với thời gian tắt */
  @error()
  async disableChatbot(disable_time: number) {
    try {
      // call api tắt AI
      await manageChatbot?.(true, disable_time)

      // đóng modal
      this.toggleModal()
    } catch (e) {
      toastError(e)
    }
  }

  /** toggle modal */
  toggleModal() {
    choose_time_disable_modal_ref.value?.toggleModal()
  }
}

const $main = new Main()

defineExpose({ toggleModal: $main.toggleModal.bind($main) })
</script>
