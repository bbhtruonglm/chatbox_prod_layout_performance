<template>
  <div class="flex flex-col gap-1">
    <div class="flex gap-3 items-center justify-between">
      <div class="text-xl font-bold">
        {{ content?.title }}
      </div>
      <slot name="toggle" />
    </div>
    <ul class="text-sm list-disc list-inside flex flex-col gap-1">
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.price') }}
        <span
          class="font-bold"
        >
          {{ content?.price }}
        </span>
      </li>
      <li
        v-if="is_full_year"
        v-html="content?.price_year"
        class="pl-2"
      />
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.page') }}
        <span class="font-semibold">
          {{ content?.page }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.upgrade.member') }}
        <span class="font-semibold">
          {{ content?.member }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_text') }}:
        <span class="font-semibold">
          {{ content?.ai_text }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_image') }}:
        <span class="font-semibold">
          {{ content?.ai_image }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_sound') }}:
        <span class="font-semibold">
          {{ content?.ai_sound }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.bot') }}:
        <span class="font-semibold">
          {{ content?.fau }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.client') }}:
        <span class="font-semibold">
          {{ content?.client }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.chat_feature') }}:
        <span class="font-semibold">
          {{ content?.chat_feature }}
        </span>
        <slot name="chat_feature" />
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.ai_feature') }}:
        <span class="font-semibold">
          {{ content?.ai_feature }}
        </span>
        <slot name="ai_feature" />
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.company_name') }}:
        <span class="font-semibold">
          {{ content?.company_name }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.api_integrate') }}:
        <span class="font-semibold">
          {{ content?.api_integrate }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.domain_logo') }}:
        <span class="font-semibold">
          {{ content?.domain_logo }}
        </span>
      </li>
      <li class="pl-2">
        {{ $t('v1.view.main.dashboard.org.pay.support') }}:
        <span class="font-semibold">
          {{ content?.support }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { useOrgStore } from '@/stores'
import type { IContent } from './type'

const orgStore = useOrgStore()

const $props = withDefaults(
  defineProps<{
    /**class cho modal */
    content: IContent
    /**mua gói Pro 1 năm */
    is_full_year?: boolean
  }>(),
  {}
)
</script>
