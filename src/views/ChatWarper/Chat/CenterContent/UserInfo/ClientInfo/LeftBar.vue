<template>
  <div
    class="w-[263px] bg-white rounded-md flex flex-col p-2 gap-2 overflow-y-auto flex-shrink-0"
  >
    <div class="py-2 px-5">
      <BlingEffect
        :show_effect="conversationStore.isFindClientInfo()"
        class="rounded-oval w-52 h-52 overflow-hidden"
        :style="'width: 208px; height: 208px'"
      >
        <ClientAvatar
          :conversation="conversationStore.select_conversation"
          class="w-52 h-52"
          :actual_size="200"
        />
      </BlingEffect>
    </div>
    <div class="flex flex-col gap-2">
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <GenderIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          <template v-if="gender">
            {{ gender }}
          </template>
          <template v-else>
            {{ $t('v1.view.main.dashboard.chat.client.unknown') }}
          </template>
        </div>
      </div>
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <GlobalIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          {{ $t('v1.common.vn') }}
        </div>
      </div>
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <LinkIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          {{
            $t(
              `v1.common.${conversationStore.select_conversation?.platform_type?.toLowerCase()}`
            )
          }}
        </div>
      </div>
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <DateWhiteIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          {{ $t('v1.view.main.dashboard.chat.client.created_at') }}:
          {{
            dateFormat(
              conversationStore.select_conversation?.createdAt,
              'dd/MM/yyyy'
            )
          }}
        </div>
      </div>
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <ClockWhiteIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          {{ $t('v1.view.main.dashboard.chat.client.updated_at') }}:
          {{
            dateFormat(
              conversationStore.select_conversation?.updatedAt,
              'hh:mm - dd/MM/yyyy'
            )
          }}
        </div>
      </div>
      <div class="pl-5 flex items-center">
        <div class="w-5 flex-shrink-0">
          <UserSquareIcon class="h-3.5" />
        </div>
        <div class="text-sm font-medium">
          {{ conversationStore.select_conversation?.fb_client_id }}
          ({{ $t('v1.view.main.dashboard.chat.client.psid') }})
        </div>
      </div>
      <div class="pl-5 flex items-start">
        <div class="w-5 flex-shrink-0">
          <TagWhiteIcon class="h-3.5" />
        </div>
        <div class="flex gap-1 min-w-0 flex-wrap">
          <div
            v-for="label_id of conversationStore.select_conversation?.label_id"
            :style="{
              background: getILabel(
                conversationStore.select_conversation?.fb_page_id,
                label_id
              )?.bg_color,
            }"
            class="text-xs px-1 text-white rounded"
          >
            {{
              getILabel(
                conversationStore.select_conversation?.fb_page_id,
                label_id
              )?.title
            }}
          </div>
        </div>
      </div>
    </div>
    <button
      @click="$main.toggleClientChatbot()"
      class="text-blue-700 bg-blue-100 rounded-md text-sm py-2 px-4 gap-2 flex items-center justify-center hover:brightness-90"
    >
      <template v-if="!is_enable">
        <PlayOutlineIcon class="w-4 h-4" />
        {{ $t('v1.view.main.dashboard.chat.client.start_bot') }}
      </template>
      <template v-else>
        <PauseWhiteIcon class="w-4 h-4" />
        {{ $t('v1.view.main.dashboard.chat.client.stop_bot') }}
      </template>
    </button>
    <ChooseTimeDisableAI ref="choose_time_disable_modal_ref" />
  </div>
</template>
<script setup lang="ts">
import { getILabel } from '@/service/function'
import { toastError } from '@/service/helper/alert'
import { dateFormat } from '@/service/helper/format'
import { useCommonStore, useConversationStore } from '@/stores'
import { ChatbotAppClient } from '@/utils/api/Chatbot'
import { composableService } from '@/views/ChatWarper/Chat/CenterContent/UserInfo/ChatbotStatus/service'
import { set } from 'lodash'
import { computed, ref } from 'vue'

import ClientAvatar from '@/components/Avatar/ClientAvatar.vue'
import BlingEffect from '@/components/BlingEffect.vue'
import ChooseTimeDisableAI from '@/views/ChatWarper/Chat/CenterContent/UserInfo/ChooseTimeDisableAI.vue'

import ClockWhiteIcon from '@/components/Icons/ClockWhite.vue'
import DateWhiteIcon from '@/components/Icons/DateWhite.vue'
import GenderIcon from '@/components/Icons/Gender.vue'
import GlobalIcon from '@/components/Icons/Global.vue'
import LinkIcon from '@/components/Icons/Link.vue'
import PauseWhiteIcon from '@/components/Icons/PauseWhite.vue'
import PlayOutlineIcon from '@/components/Icons/PlayOutline.vue'
import TagWhiteIcon from '@/components/Icons/TagWhite.vue'
import UserSquareIcon from '@/components/Icons/UserSquare.vue'

const { is_enable } = composableService()
const conversationStore = useConversationStore()
const commonStore = useCommonStore()

/**ref của modal */
const choose_time_disable_modal_ref = ref<InstanceType<typeof ChooseTimeDisableAI>>()

/**giới tính */
const gender = computed(
  () => conversationStore.select_conversation?.client_bio?.fb_info?.gender
)
/**id của trang */
const page_id = computed(
  () => conversationStore.select_conversation?.fb_page_id
)
/**id của khách hàng */
const client_id = computed(
  () => conversationStore.select_conversation?.fb_client_id
)

class Main {
  toggleClientChatbot() {
    // nếu không tồn tại cờ bật/tắt chatbot thì thôi
    if(is_enable === undefined) return

    // nếu đang bật thì mở modal tắt
    if(is_enable?.value) {
      choose_time_disable_modal_ref.value?.toggleModal()
      return
    }
    
    // nếu đang tắt chatbot thì bật cờ
    is_enable.value = true
  }
}

const $main = new Main()

/**tắt bật chatbot của khách */
async function toggleClientChatbot() {
  // nếu chưa có id của trang hoặc id của khách hàng thì không làm gì cả
  if (!page_id.value || !client_id.value || commonStore.is_loading_full_screen)
    return

  // hiển thị loading
  commonStore.is_loading_full_screen = true

  try {
    /**cờ trạng thái mới của chatbot */
    const IS_TOGGLE = !conversationStore.chatbot_client?.client_is_stop

    // gửi yêu cầu thay đổi trạng thái chatbot
    await new ChatbotAppClient(page_id.value, client_id.value).toggleClient(
      IS_TOGGLE
    )

    // cập nhật lại trạng thái chatbot
    set(conversationStore, 'chatbot_client.client_is_stop', IS_TOGGLE)
  } catch (e) {
    toastError(e)
  }

  // ẩn loading
  commonStore.is_loading_full_screen = false
}
</script>
