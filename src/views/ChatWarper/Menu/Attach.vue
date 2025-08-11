<template>
  <Popover
    ref="attach_ref"
    :is_fit="false"
    width="349px"
    height="auto"
    position="RIGHT"
    class_content="flex flex-col gap-1 max-h-[calc(100vh-100px)] overflow-y-auto"
  >
    <MenuTitle :title="$t('v1.view.main.dashboard.nav.chat')" />
    <MenuItem
      :icon="ChatIcon"
      :title="$t('v1.view.main.dashboard.nav.chat')"
      :is_selected="true"
    />
    <MenuItem
      @click="$router.push('/dashboard/select-page')"
      :icon="FlagIcon"
      :title="$t('Trình quản lý Trang')"
    />
    <hr class="my-1" />
    <MenuTitle :title="$t('v1.common.page')" />
    <MenuItem
      @click="$external_site.openMerchant('login', 'a/order')"
      :icon="OrderIcon"
      :title="$t('v1.common.order')"
    >
      <NewTabIcon class="flex-shrink-0 w-4 h-4 text-gray-500" />
    </MenuItem>
    <MenuItem
      @click="$external_site.openPageAnalytic()"
      :icon="AnalyticIcon"
      :title="$t('v1.view.main.dashboard.nav.analytic')"
    >
      <NewTabIcon class="flex-shrink-0 w-4 h-4 text-gray-500" />
    </MenuItem>
    <MenuItem
      @click="$external_site.openPageChatbot()"
      :icon="ManyChatIcon"
      :title="$t('v1.view.main.dashboard.nav.bot')"
    >
      <NewTabIcon class="flex-shrink-0 w-4 h-4 text-gray-500" />
    </MenuItem>
    <MenuItem
      v-if="pageStore.isPageAdminOrOrgAdmin(conversationStore.select_conversation?.fb_page_id)"
      @click="$external_site.openPageSetting()"
      :icon="CogIcon"
      :title="$t('v1.view.main.dashboard.nav.setting')"
    >
      <NewTabIcon class="flex-shrink-0 w-4 h-4 text-gray-500" />
    </MenuItem>
    <hr class="my-1" v-if="orgStore.isAdminOrg()" />
    <OrgSetting />
  </Popover>
</template>

<script setup lang="ts">
import { useConversationStore, useOrgStore, usePageStore } from '@/stores'
import { ExternalSite } from '@/utils/helper/ExternalSite'
import { container } from 'tsyringe'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Popover from '@/components/Popover.vue'
import Dropdown from '@/components/Dropdown.vue'
import MenuItem from '@/components/Main/Dashboard/MenuItem.vue'
import MenuTitle from '@/components/Main/Dashboard/MenuTitle.vue'

import AnalyticIcon from '@/components/Icons/Analytic.vue'
import ChatIcon from '@/components/Icons/Chat.vue'
import CogIcon from '@/components/Icons/Cog.vue'
import ManyChatIcon from '@/components/Icons/ManyChat.vue'
import NewTabIcon from '@/components/Icons/NewTab.vue'
import OrderIcon from '@/components/Icons/Order.vue'
import OrgSetting from '@/components/Main/OrgSetting.vue'
import { FlagIcon } from '@heroicons/vue/24/solid'

const { t: $t } = useI18n()
const $router = useRouter()
const orgStore = useOrgStore()
const pageStore = usePageStore()
const conversationStore = useConversationStore()
const $external_site = container.resolve(ExternalSite)

/**ref của menu đính kèm */
const attach_ref = ref<InstanceType<typeof Popover>>()

/**ẩn hiện menu */
// function toggleDropdown($event?: MouseEvent) {
//   attach_ref.value?.toggleDropdown($event)
// }

// defineExpose({ toggleDropdown })
defineExpose({ attach_ref })
</script>
