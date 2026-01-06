<template>
  <div
    v-if="message?.client_phone && message_type == 'client'"
    class="flex items-center py-1.5 gap-2"
  >
    <button
      v-if="pageStore.zlp_oss?.length"
      @click="
        () => {
          message_data = message
          modal_zalo_personal_ref?.toggleModal()
        }
      "
      v-tooltip="$t('Zalo cá nhân')"
      class="w-6 h-6 flex justify-center items-center rounded-full border border-blue-700 bg-blue-100"
      :aria-label="$t('Zalo cá nhân')"
    >
      <Zalo
        class="w-3 h-3"
        alt="zalo_icon"
      ></Zalo>
    </button>
    <button
      v-if="orgStore.selected_org_info?.org_package?.org_allow_message_action"
      @click="$main.openCallCenter()"
      v-tooltip="$t('Gọi điện')"
      class="w-6 h-6 flex justify-center items-center rounded-full border border-green-600 bg-green-100"
      :aria-label="$t('Gọi điện')"
    >
      <PhoneIcon
        class="w-3 h-3 text-green-600"
        alt="phone_icon"
      ></PhoneIcon>
    </button>
    <Widget
      ref="modal_widget_ref"
      :selected_widget
    />
    <!-- <ZaloPersonalModal
      :message
      ref="modal_zalo_personal_ref"
    /> -->
  </div>
</template>
<script setup lang="ts">
import Widget from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/MessageTemplate/Widget.vue'
// import ZaloPersonalModal from '@/views/ChatWarper/Chat/CenterContent/MessageList/MessageItem/PhoneAction/ZaloPersonalModal.vue'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { MessageInfo } from '@/service/interface/app/message'
import { Parser } from '@/utils/helper/Parser'

//* icon
import Zalo from '@/components/Icons/Zalo.vue'
import type { AppInstalledInfo } from '@/service/interface/app/widget'
import {
  useConversationStore,
  useMessageStore,
  useOrgStore,
  usePageStore,
} from '@/stores'
import { PhoneIcon } from '@heroicons/vue/24/solid'

const $props = withDefaults(
  defineProps<{
    /**dữ liệu của tin nhắn */
    message: MessageInfo
  }>(),
  {}
)

const pageStore = usePageStore()
const conversationStore = useConversationStore()
const orgStore = useOrgStore()

const { modal_zalo_personal_ref, message_data } = storeToRefs(useMessageStore())

/**tin nhắn này thuộc về dạng nào */
const message_type = computed(() => $props.message?.message_type)
/**ref của modal widget */
const modal_widget_ref = ref<InstanceType<typeof Widget>>()
/**ref của modal zlp */
// const modal_zalo_personal_ref = ref<InstanceType<typeof ZaloPersonalModal>>()
/**dữ liệu của widget được chọn */
const selected_widget = ref<AppInstalledInfo>()

class Main {
  /**mở modal call center */
  openCallCenter() {
    // tạm thời fix cứng
    /**id của widget gọi điện */
    const CALL_CENTER_WIDGET_ID = '680f3335ff2c365808e08ec0'

    /**dữ liệu của widget */
    const WIDGET = pageStore.market_widgets?.[CALL_CENTER_WIDGET_ID]

    /**dữ liệu của widget theo luồng mới */
    const NEW_PARAM = Parser.toQueryString({
      partner_token:
        pageStore.selected_page_list_info?.[
          conversationStore.select_conversation?.fb_page_id!
        ]?.partner_token,
      client_id: conversationStore.select_conversation?.fb_client_id,
      message_id: $props.message?._id,
      message_phone: $props.message?.client_phone,
      // comment_id: $props.comment_id,
    })

    // tạo dữ liệu giống như app đã cài
    selected_widget.value = {
      url: WIDGET?.url_app + `?${NEW_PARAM}`,
      snap_app: WIDGET,
    }

    // mở modal
    modal_widget_ref.value?.toggleModal()
  }
  openZalo() {}
}
const $main = new Main()
</script>
