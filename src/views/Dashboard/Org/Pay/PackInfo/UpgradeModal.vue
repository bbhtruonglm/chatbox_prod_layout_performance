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
        class="absolute top-0 left-0 w-screen h-screen bg-black/10 z-20 shadow-lg"
      >
        <div
          @click.stop
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white w-max flex flex-col shadow-lg p-3 gap-4 pb-5"
        >
          <div class="px-3 text-lg font-semibold flex-shrink-0 text-center">
            {{ $t('v1.view.main.dashboard.org.pay.upgrade.title') }}
          </div>
          <div class="grid grid-cols-3 gap-3 px-10">
            <div class="item">
              <Content :content="CONTENTS.FREE" />
              <button
                v-if="orgStore.isFreePack() || orgStore.isTrialPack()"
                @click="downgradeFreePack"
                class="btn text-slate-700 bg-slate-200 cursor-not-allowed"
              >
                {{ $t('v1.view.main.dashboard.org.pay.upgrade.current') }}
              </button>
            </div>
            <div class="item">
              <Content
                :content="CONTENTS.PRO"
                :is_full_year
              >
                <template #toggle>
                  <Toggle
                    v-model="is_full_year"
                    class_toggle="peer-checked:bg-black"
                  >
                    <span class="text-green-600">
                      {{
                        $t('v1.view.main.dashboard.org.pay.upgrade.year')
                      }}
                    </span>
                  </Toggle>
                </template>
                <template #chat_feature>
                  (<a
                    class="underline text-blue-700"
                    href="https://retion.ai"
                    target="_blank"
                  >
                    {{ $t('v1.view.main.dashboard.org.pay.upgrade.more') }} </a
                  >)
                </template>
                <template #ai_feature>
                  (<a
                    class="underline text-blue-700"
                    href="https://retion.ai"
                    target="_blank"
                  >
                    {{ $t('v1.view.main.dashboard.org.pay.upgrade.more') }} </a
                  >)
                </template>
              </Content>
              <button
                v-if="!orgStore.isBusinessPack()"
                @click="activeTrialOrProPack('PRO')"
                :class="{
                  'cursor-not-allowed !text-slate-700 bg-slate-200':
                    orgStore.isProPack(),
                  'bg-blue-600 text-white': !orgStore.hasTrial(),
                  'bg-green-600 text-white': orgStore.hasTrial(),
                }"
                class="btn"
              >
                <template
                  v-if="
                    orgStore.isFreePack() &&
                    !orgStore.selected_org_info?.org_package?.org_has_trial
                  "
                >
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.trial_day_7') }}
                </template>
                <template v-else-if="orgStore.isProPack()">
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.current') }}
                </template>
                <template v-else>
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.pro') }}
                </template>
              </button>
            </div>
            <div class="item">
              <Content
                :content="CONTENTS.COMPANY"
                :is_full_year
              >
                <template #toggle>
                  <Toggle
                    v-model="is_full_year"
                    class_toggle="peer-checked:bg-black"
                  >
                    <span class="text-green-600">
                      {{
                        $t('v1.view.main.dashboard.org.pay.upgrade.year')
                      }}
                    </span>
                  </Toggle>
                </template>
              </Content>
              <button
                :class="{
                  'cursor-not-allowed !text-slate-700 bg-slate-200':
                    orgStore.isBusinessPack(),
                }"
                @click="activeTrialOrProPack('BUSINESS')"
                class="btn text-white bg-green-600"
              >
                <template v-if="orgStore.isBusinessPack()">
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.current') }}
                </template>
                <template v-else>
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.business') }}
                </template>
              </button>
            </div>
          </div>
          <a
            :href="`https://${commonStore.partner?.domain}/pricing`"
            target="_blank"
            class="text-slate-700 flex items-center gap-1 w-fit mx-auto"
          >
            {{ $t('v1.view.main.dashboard.org.pay.upgrade.detail') }}
            <NewTabIcon class="w-4 h-4" />
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { currency } from '@/service/helper/format'
import { ref } from 'vue'
import { useCommonStore, useOrgStore } from '@/stores'
import { openNewTab } from '@/service/function'
import { BBH_PAGE_MESS } from '@/configs/constants/botbanhang'
// import { BBH_PAGE_MESS } from '@/service/constant/botbanhang'
import { toast, toastError } from '@/service/helper/alert'
import {
  active_discount,
  purchase_package,
  read_wallet,
} from '@/service/api/chatbox/billing'
import { useI18n } from 'vue-i18n'

import Toggle from '@/components/Toggle.vue'
import Content from '@/views/Dashboard/Org/Pay/PackInfo/UpgradeModal/Content.vue'

import NewTabIcon from '@/components/Icons/NewTab.vue'

import type { IContent } from './UpgradeModal/type'

const commonStore = useCommonStore()
const orgStore = useOrgStore()
const { t: $t } = useI18n()

/**nội dung của các gói */
const CONTENTS: Record<string, IContent> = {
  /**gói miễn phí */
  FREE: {
    title: $t('v1.view.main.dashboard.org.pay.free'),
    price: $t('v1.view.main.dashboard.org.pay.free'),
    page: '2',
    member: '1',
    ai_text: '100.000 ' + $t('v1.view.main.dashboard.org.pay.text'),
    ai_image: '100 ' + $t('v1.view.main.dashboard.org.pay.image'),
    ai_sound: '100 ' + $t('v1.view.main.dashboard.org.pay.minute'),
    fau: '1.000 ' + $t('v1.view.main.dashboard.org.pay.fau'),
    client: '600',
    chat_feature: $t('v1.view.main.dashboard.org.pay.basic'),
    ai_feature: $t('v1.view.main.dashboard.org.pay.basic'),
    company_name: $t('v1.view.main.dashboard.org.pay.none'),
    api_integrate: $t('v1.view.main.dashboard.org.pay.none'),
    domain_logo: $t('v1.view.main.dashboard.org.pay.none'),
    support: $t('v1.view.main.dashboard.org.pay.standard'),
  },
  /**gói Pro */
  PRO: {
    title: $t('v1.view.main.dashboard.org.pay.pro'),
    price: '480.000 / ' + $t('v1.view.main.dashboard.org.pay.month'),
    price_year: $t('v1.view.main.dashboard.org.pay.avarage_year', {
      amount: '5.760.000',
    }),
    price_discount:
      '<span class="line-through font-normal">480.000</span> <span class="text-green-700">288,000</span> / ' +
      $t('v1.view.main.dashboard.org.pay.month'),
    price_discount_year: $t('v1.view.main.dashboard.org.pay.avarage_year', {
      amount: '3.456.000',
    }),
    page: '5',
    member: '10',
    ai_text: '1.000.000 ' + $t('v1.view.main.dashboard.org.pay.text'),
    ai_image: '1.000 ' + $t('v1.view.main.dashboard.org.pay.image'),
    ai_sound: '1000 ' + $t('v1.view.main.dashboard.org.pay.minute'),
    fau: '10.000 ' + $t('v1.view.main.dashboard.org.pay.fau'),
    client: $t('v1.view.main.dashboard.org.pay.unlimited'),
    chat_feature: $t('v1.view.main.dashboard.org.pay.all'),
    ai_feature: $t('v1.view.main.dashboard.org.pay.all'),
    company_name: $t('v1.view.main.dashboard.org.pay.yes'),
    api_integrate: $t('v1.view.main.dashboard.org.pay.yes'),
    domain_logo: $t('v1.view.main.dashboard.org.pay.none'),
    support: $t('v1.view.main.dashboard.org.pay.prioritize'),
  },
  /**gói doanh nghiệp */
  COMPANY: {
    title: $t('v1.view.main.dashboard.org.pay.business'),
    price: '2.600.000 / ' + $t('v1.view.main.dashboard.org.pay.month'),
    price_year: $t('v1.view.main.dashboard.org.pay.avarage_year', {
      amount: '31.200.000',
    }),
    price_discount:
      '<span class="line-through font-normal">2.600.000</span> <span class="text-green-700">2.080.000</span> / ' +
      $t('v1.view.main.dashboard.org.pay.month'),
    price_discount_year: $t('v1.view.main.dashboard.org.pay.avarage_year', {
      amount: '24.960.000',
    }),
    page: '40',
    member: '40',
    ai_text: '10.000.000 ' + $t('v1.view.main.dashboard.org.pay.text'),
    ai_image: '10.000 ' + $t('v1.view.main.dashboard.org.pay.image'),
    ai_sound: '10.000 ' + $t('v1.view.main.dashboard.org.pay.minute'),
    fau: '50.000 ' + $t('v1.view.main.dashboard.org.pay.fau'),
    client: $t('v1.view.main.dashboard.org.pay.unlimited'),
    chat_feature: $t('v1.view.main.dashboard.org.pay.all'),
    ai_feature: $t('v1.view.main.dashboard.org.pay.all'),
    company_name: $t('v1.view.main.dashboard.org.pay.yes'),
    api_integrate: $t('v1.view.main.dashboard.org.pay.yes'),
    domain_logo: $t('v1.view.main.dashboard.org.pay.yes'),
    support: $t('v1.view.main.dashboard.org.pay.high'),
  },
}

/**ẩn hiện modal */
const is_open = ref(false)
/**mua gói Pro 1 năm */
const is_full_year = ref(false)

/**ẩn hiện modal */
function toggleModal() {
  is_open.value = !is_open.value
}
/**liên hệ với chúng tôi */
function contactUs() {
  // nếu đang ở gói doanh nghiệp thì không mở tab
  if (orgStore.isBusinessPack()) return

  // mở tab liên hệ với chúng tôi
  openNewTab(BBH_PAGE_MESS)
}
/**kích hoạt gói dùng thử hoặc gói pro */
async function activeTrialOrProPack(pack: 'PRO' | 'BUSINESS') {
  // nếu chưa chọn org thì không làm gì
  if (!orgStore.selected_org_id || orgStore.is_loading) return

  // nếu đã mua gói thì không làm gì
  if (orgStore.isProPack() && pack === 'PRO') return
  // nếu đã mua gói doanh nghiệp thì không làm gì
  if (orgStore.isBusinessPack() && pack === 'BUSINESS') return

  // kích hoạt loading
  orgStore.is_loading = true

  try {
    /**
     * tính toán gói cần mua
     * - nếu chưa mua bao giờ mà mua gói PRO, thì cho dùng thử trước
     * - nếu đã dùng thử rồi thì mua đúng
     */
    const PACKAGE = !orgStore.hasTrial() && pack === 'PRO' ? 'TRIAL' : pack

    /**dữ liệu của ví */
    const WALLET = await read_wallet(orgStore.selected_org_id)

    // nếu không có ví thì thông báo lỗi
    if (!WALLET?.wallet_id)
      throw $t('v1.view.main.dashboard.org.pay.recharge.wrong_wallet_id')

    /**số tháng mua */
    const MONTHS = is_full_year.value ? 12 : 1

    // yêu cầu mua gói
    await purchase_package(
      orgStore.selected_org_id,
      WALLET?.wallet_id,
      PACKAGE,
      MONTHS
    )

    // thông báo mua gói thành công
    toast('success', $t('v1.view.main.dashboard.org.pay.upgrade.success'))

    // chờ 1s
    await new Promise(cb => setTimeout(cb, 1000))

    // reload lại trang
    window.location.reload()
  } catch (e) {
    if (e === 'WALLET.NOT_ENOUGH_MONEY')
      toastError($t('v1.view.main.dashboard.org.pay.upgrade.not_enough_money'))
    // nếu có lỗi thì hiện thông báo lỗi
    else toastError(e)
  }

  // tắt loading
  orgStore.is_loading = false
}
/**hạ xuống gói free */
function downgradeFreePack() {}

defineExpose({ toggleModal })
</script>
<style scoped lang="scss">
.item {
  @apply bg-slate-100 p-2 rounded-lg flex flex-col justify-between gap-8;
}
.btn {
  @apply py-2 px-4 rounded-md hover:brightness-90 text-sm font-semibold;
}
</style>
