<template>
  <div
    class="dashboard-header bg-white rounded-lg py-3 px-6 flex justify-between"
  >
    <button
      @click="$router.push('/dashboard/select-page')"
      class="flex gap-3 items-center"
    >
      <img
        :src="commonStore.partner?.logo?.full"
        class="h-8"
      />
    </button>
    <div class="flex gap-7 items-center">
      <slot name="right" />
      <User
        position="BOTTOM"
        :back="237"
      />
      <button
        @click="attach_ref?.toggleDropdown"
        v-tooltip.bottom="$t('v1.view.main.dashboard.nav.menu')"
        class="rounded-lg group"
      >
        <Squares2X2Icon class="w-7 h-7 m-auto group-hover:text-red-600" />
      </button>
    </div>
    <Dropdown
      ref="attach_ref"
      :is_fit="false"
      :back="300"
      width="349px"
      height="auto"
      position="BOTTOM"
      class_content="flex flex-col gap-1 max-h-[calc(100vh-100px)]"
    >
      <OrgSetting @close="attach_ref?.toggleDropdown"/>
    </Dropdown>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useCommonStore } from '@/stores'

import User from '@/components/User.vue'

import { Squares2X2Icon } from '@heroicons/vue/24/solid';
import Dropdown from '@/components/Dropdown.vue';
import OrgSetting from '@/components/Main/OrgSetting.vue';

const commonStore = useCommonStore()

/**ref của menu đính kèm */
const attach_ref = ref<InstanceType<typeof Dropdown>>()

</script>
