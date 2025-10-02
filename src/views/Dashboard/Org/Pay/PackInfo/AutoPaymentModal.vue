<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-in-out duration-300"
      leave-active-class="transition ease-in-out duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="is_confirm_open"
        class="fixed top-0 left-0 w-screen h-screen py-10 bg-black/30 z-30 flex items-center justify-center"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-6 w-[800px] max-h-full text-center flex flex-col gap-4"
          @click.stop
        >
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">
              <!-- {{ $t('v1.view.main.dashboard.org.pay.upgrade.confirm_title') }} -->
              {{ title }}
            </h3>
            <div
              @click="handleClose"
              class="cursor-pointer"
            >
              <XMarkIcon class="size-4" />
            </div>
          </div>

          <div
            class="overflow-hidden min-h-0 flex-grow overflow-y-auto flex flex-col gap-2.5"
          >
            <div
              class="flex gap-2.5"
              :class="[
                pay_step === 'STEP_2'
                  ? 'border-b border-dashed border-slate-500'
                  : '',
              ]"
            >
              <div
                v-if="MONTHS && size(MONTHS) > 0"
                class="py-3 w-1/2 flex flex-col gap-2.5 items-start text-sm"
              >
                <label class="font-semibold">{{ $t('Thông tin gói') }}</label>
                <p>
                  {{
                    $t('v1.view.main.dashboard.org.pay.upgrade.upgrade_package')
                  }}
                  :
                  <span class="font-semibold">
                    {{ renderPackageName(selected_pack) }}
                  </span>
                </p>
                <p>
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.time') }} :
                  <span class="font-semibold">
                    {{ MONTHS.find(item => item.value === SELECTED)?.label }}
                  </span>
                </p>
                <p>
                  {{ $t('v1.view.main.dashboard.org.pay.upgrade.cost') }} :
                  <span class="font-semibold">
                    {{ currency(Number(amount)) }}đ
                  </span>
                </p>
              </div>
              <div
                v-else
                class="py-3 w-1/2 flex flex-col gap-2.5 items-start text-sm"
              >
                <label class="font-semibold">{{ $t('Thông tin gói') }}</label>
                <p>
                  {{
                    $t('v1.view.main.dashboard.org.pay.upgrade.upgrade_package')
                  }}
                  :
                  <span class="font-semibold">
                    {{
                      $t(
                        `v1.view.main.dashboard.org.pay.inc_quota.${payment_type.toLowerCase()}`
                      )
                    }}
                  </span>
                </p>
                <div>
                  {{ $t('v1.view.main.dashboard.org.pay.inc_quota.total') }}
                  <span
                    v-if="payment_type === 'PAGE'"
                    class="font-semibold"
                  >
                    {{ SELECTED }}
                    {{ $t('v1.view.main.dashboard.org.pay.inc_quota.a_page') }}
                    x
                    {{ orgStore.calcDayRemaining() }}
                    {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }}
                    x 2.000đ
                  </span>
                  <span
                    v-if="payment_type === 'STAFF'"
                    class="font-semibold"
                  >
                    {{ SELECTED }}
                    {{ $t('v1.view.main.dashboard.org.pay.inc_quota.a_staff') }}
                    x
                    {{ orgStore.calcDayRemaining() }}
                    {{ $t('v1.view.main.dashboard.org.pay.inc_quota.day') }}
                    x 1.000đ
                  </span>
                </div>
                <p>
                  {{ $t('v1.view.main.dashboard.org.pay.inc_quota.need_pay') }}
                  :
                  <span class="font-semibold">
                    {{ currency(Number(amount)) }}đ
                  </span>
                </p>
              </div>
              <div class="py-3 w-1/2 text-sm flex flex-col gap-2.5 items-start">
                <label class="font-semibold">{{
                  $t('Thông tin thanh toán')
                }}</label>
                <div class="flex gap-5">
                  <Radio
                    v-model="is_issue_invoice"
                    :value="false"
                    :title="
                      $t('v1.view.main.dashboard.org.pay.recharge.no_invoice')
                    "
                    :disabled="pay_step === 'STEP_2'"
                  />
                  <Radio
                    v-model="is_issue_invoice"
                    :value="true"
                    :title="
                      $t('v1.view.main.dashboard.org.pay.recharge.need_invoice')
                    "
                    :disabled="pay_step === 'STEP_2'"
                  />
                </div>
                <p>
                  {{
                    $t('v1.view.main.dashboard.org.pay.upgrade.total_amount')
                  }}
                  :
                  <span class="font-semibold">
                    {{ currency(Number(amount) - wallet_balance) }}đ
                  </span>
                </p>
                <div class="w-full flex flex-col gap-2">
                  <div class="text-start">
                    {{
                      $t(
                        'v1.view.main.dashboard.org.pay.recharge.voucher.title'
                      )
                    }}
                  </div>
                  <div class="pt-0 flex flex-col gap-2">
                    <input
                      v-if="pay_step === 'STEP_1'"
                      v-model="voucher_code"
                      @keyup="DEBOUNCE_VERIFY_VOUCHER"
                      class="focus:outline-gray-400 py-2 px-3 rounded-md border w-full"
                      :placeholder="
                        $t(
                          'v1.view.main.dashboard.org.pay.recharge.voucher.description'
                        )
                      "
                    />
                    <div
                      v-else
                      class="py-2 px-3 rounded-md border w-full"
                    >
                      <span v-if="voucher_code">{{ voucher_code }}</span>
                      <span
                        v-else
                        class="text-slate-500"
                      >
                        {{
                          $t(
                            'v1.view.main.dashboard.org.pay.recharge.voucher.empty'
                          )
                        }}
                      </span>
                    </div>
                    <div
                      v-if="verify_voucher?.is_verify === false"
                      class="text-sm text-red-500"
                    >
                      {{
                        $t(
                          'v1.view.main.dashboard.org.pay.recharge.voucher.wrong'
                        )
                      }}
                    </div>
                    <div
                      v-else
                      class="text-sm text-green-600 text-left"
                    >
                      {{
                        getPriceChangeText(
                          Number(verify_voucher?.txn_origin_amount),
                          Number(verify_voucher?.txn_amount)
                        )
                      }}
                    </div>
                  </div>
                </div>
                <p>
                  {{
                    $t('v1.view.main.dashboard.org.pay.upgrade.payment_amount')
                  }}
                  :
                  <span class="font-semibold text-green-600">
                    <!-- {{
                      payment_type === 'PACKAGE'
                        ? currency(
                            Number(verify_voucher?.txn_amount || amount) -
                              wallet_balance
                          )
                        : currency(Number(amount) - wallet_balance)
                    }}đ -->
                    {{
                      currency(
                        Number(verify_voucher?.txn_amount || amount) -
                          wallet_balance
                      )
                    }}đ
                  </span>
                </p>
              </div>
            </div>
            <div
              v-if="pay_step === 'STEP_2'"
              class="text-left"
            >
              <div class="flex flex-col p-4 pt-0 gap-3">
                <div
                  v-if="is_issue_invoice"
                  class="flex flex-col gap-1 text-sm"
                >
                  <!-- Header + nút -->
                  <div class="flex justify-between items-center">
                    <div class="font-semibold">
                      {{
                        $t(
                          'v1.view.main.dashboard.org.pay.recharge.invoice_info.title'
                        )
                      }}
                    </div>
                    <button
                      v-if="!is_edit"
                      @click="$main.activeEdit"
                      class="bg-blue-600 text-white py-1 px-4 rounded-md text-sm font-medium"
                    >
                      {{ $t('v1.common.change') }}
                    </button>
                    <div
                      v-else
                      class="flex gap-2"
                    >
                      <button
                        v-if="!orgStore.is_loading"
                        @click="$main.save"
                        class="bg-green-600 text-white py-1 px-4 rounded-md text-sm font-medium"
                      >
                        <span class="hidden md:block">{{
                          $t('v1.common.ok')
                        }}</span>
                        <span class="block md:hidden">✔︎</span>
                      </button>
                      <button
                        @click="$main.cancelEdit"
                        class="bg-gray-600 text-white py-1 px-4 rounded-md text-sm font-medium"
                      >
                        <span class="hidden md:block">{{
                          $t('v1.common.cancel')
                        }}</span>
                        <span class="block md:hidden">✕</span>
                      </button>
                    </div>
                  </div>

                  <!-- VIEW MODE -->
                  <template v-if="!is_edit">
                    <div class="font-semibold">
                      {{ org_info.org_company_name || org_info.org_name }}
                      <template v-if="org_info.org_tax_code">
                        -
                        {{
                          $t(
                            'v1.view.main.dashboard.org.pay.recharge.invoice_info.tax_code'
                          )
                        }}:
                        {{ org_info.org_tax_code }}
                      </template>
                    </div>
                    <div class="flex">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.address'
                          )
                        }}:
                      </div>
                      <div>{{ org_info.org_address }}</div>
                    </div>
                    <div class="flex">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.representative'
                          )
                        }}:
                      </div>
                      <div>{{ org_info.org_representative }}</div>
                    </div>
                    <div class="flex">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.phone'
                          )
                        }}:
                      </div>
                      <div>{{ org_info.org_phone }}</div>
                    </div>
                    <div class="flex">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.email'
                          )
                        }}:
                      </div>
                      <div>{{ org_info.org_email }}</div>
                    </div>
                  </template>

                  <!-- EDIT MODE -->
                  <template v-else>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.company_name'
                          )
                        }}:
                      </div>
                      <input
                        disabled
                        v-model="org_info.org_company_name"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.tax_code'
                          )
                        }}:
                      </div>
                      <input
                        v-model="org_info.org_tax_code"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.address'
                          )
                        }}:
                      </div>
                      <input
                        v-model="org_info.org_address"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.representative'
                          )
                        }}:
                      </div>
                      <input
                        v-model="org_info.org_representative"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.phone'
                          )
                        }}:
                      </div>
                      <input
                        v-model="org_info.org_phone"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                    <div class="flex items-center">
                      <div class="w-32">
                        {{
                          $t(
                            'v1.view.main.dashboard.org.setting.customer_info.email'
                          )
                        }}:
                      </div>
                      <input
                        v-model="org_info.org_email"
                        class="border p-1 rounded w-full"
                      />
                    </div>
                  </template>
                </div>
                <ul
                  v-if="is_issue_invoice"
                  class="list-disc list-inside text-sm text-slate-700"
                >
                  <li class="pl-4 -indent-4">
                    {{
                      $t(
                        'v1.view.main.dashboard.org.setting.customer_info.guild_1',
                        {
                          partner: commonStore.partner?.name,
                        }
                      )
                    }}
                  </li>
                  <li class="pl-4 -indent-4">
                    {{
                      $t(
                        'v1.view.main.dashboard.org.setting.customer_info.guild_3',
                        {
                          partner: commonStore.partner?.name,
                        }
                      )
                    }}
                    <!-- hotro@botbanhang.vn -->
                  </li>
                </ul>
              </div>

              <div class="px-4 py-1 font-medium">
                {{ $t('v1.view.main.dashboard.org.pay.recharge.pay') }}
              </div>
              <div class="p-4 pt-0 flex flex-col gap-5">
                <template v-for="method of LIST_PAYMENT_METHOD">
                  <Radio
                    v-if="
                      pay_step === 'STEP_2' && payment_method === method.value
                    "
                    v-model="payment_method"
                    :value="method.value"
                    :title="method.title"
                    :disabled="method.disabled"
                    :class="{
                      '!cursor-not-allowed': method.disabled,
                    }"
                  />
                </template>
                <template v-if="pay_step === 'STEP_2'">
                  <template v-if="payment_method === 'TRANSFER'">
                    <TransferInfo
                      v-model="txn_info"
                      v-model:check_payment="check_payment"
                      :amount="calcBankAmount()"
                      :txn_id="txn_info?.txn_id"
                      :is_issue_invoice
                      :is_pay_partner="
                        verify_voucher?.voucher_is_pay_partner ||
                        txn_info?.txn_voucher_info?.voucher_is_pay_partner
                      "
                      :partner_info="
                        verify_voucher?.voucher_partner_info ||
                        txn_info?.txn_voucher_info?.voucher_partner_info
                      "
                      :wallet_balance="wallet_balance.toString()"
                      :is_modal="true"
                    />
                    <!-- <button
                    v-if="txn_info?.txn_status !== 'SUCCESS'"
                    @click="checkPayment"
                    class="py-2 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:brightness-90 w-fit uppercase"
                  >
                    {{
                      $t(
                        'v1.view.main.dashboard.org.pay.recharge.transfer_info.check'
                      )
                    }}
                  </button> -->
                  </template>
                  <template v-else> Tính năng đang phát triển! </template>
                </template>
                <!-- <button
                  v-if="pay_step === 'STEP_1'"
                  @click="createTxn"
                  class="py-2 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:brightness-90 w-fit"
                >
                  {{ $t('v1.view.main.dashboard.org.pay.recharge.continue') }}
                </button> -->
              </div>
            </div>
          </div>

          <div class="flex justify-between gap-4 w-full text-sm">
            <button
              @click="handleClose"
              class="py-2 px-4 rounded-md bg-slate-200 hover:brightness-95"
            >
              {{ $t('v1.view.main.dashboard.org.pay.upgrade.close') }}
            </button>
            <!-- @click="confirmPayment" -->
            <!-- :disabled="pay_step === 'STEP_2'" -->
            <button
              @click="pay_step !== 'STEP_2' && createTxn()"
              :class="[
                'py-2 px-4 rounded-md ',
                pay_step === 'STEP_2'
                  ? 'bg-blue-100 cursor-not-allowed text-blue-700'
                  : 'bg-blue-700 text-white hover:brightness-95',
              ]"
            >
              {{
                pay_step === 'STEP_2'
                  ? $t(
                      'v1.view.main.dashboard.org.pay.recharge.waiting_payment'
                    )
                  : $t('v1.view.main.dashboard.org.pay.upgrade.confirm')
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-in-out duration-300"
      leave-active-class="transition ease-in-out duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="is_success_open"
        class="fixed top-0 left-0 w-screen h-screen py-10 bg-black/30 z-40 flex items-center justify-center"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-6 w-[500px] text-center flex flex-col gap-4 animate-in fade-in"
          @click.stop
        >
          <div class="flex flex-col items-center gap-3">
            <!-- Icon success -->
            <CheckCircleIcon class="size-10 text-green-600" />
            <h3 class="text-lg font-semibold text-green-600">
              {{ $t('v1.view.main.dashboard.org.pay.recharge.success') }}
            </h3>
            <p class="text-slate-600 text-sm">
              {{ $t('v1.view.main.dashboard.org.pay.recharge.success_desc') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

import TransferInfo from '@/views/Dashboard/Org/Pay/PackInfo/TransferInfo.vue'

import Radio from '@/views/Dashboard/Org/Pay/ReCharge/Radio.vue'
import { useCommonStore, useOrgStore } from '@/stores'
import { useI18n } from 'vue-i18n'

import type {
  ITxnMeta,
  OrgInfo,
  TransactionInfo,
} from '@/service/interface/app/billing'
import { debounce, set, size } from 'lodash'
import {
  create_txn,
  read_wallet,
  update_org,
} from '@/service/api/chatbox/billing'
import { toastError } from '@/service/helper/alert'
import { BillingAppVoucher } from '@/utils/api/Billing'
import { copy, currency } from '@/service/helper/format'
import type { is } from 'date-fns/locale'
import { loading } from '@/utils/decorator/Loading'
import { error } from '@/utils/decorator/Error'
import { container } from 'tsyringe'
import { Toast } from '@/utils/helper/Alert/Toast'
/** nhận props từ cha */
const props = defineProps<{
  /** Đóng mở modal */
  is_confirm_open: boolean
  /** Tiêu đề modal */
  title: string
  /** Gói đã chọn */
  selected_pack: string | undefined
  /** Số lượng hoặc giá gói */
  amount: string
  /** Số dư ví */
  wallet_balance: number
  /** Số tháng chọn || Số nhân viên || Số trang */
  SELECTED?: string
  /** Hàm đóng modal */
  closeConfirmModal: () => void
  /** Số tháng mua gói */
  MONTHS?: { label: string; value: string }[]
  /** Trạng thái mở modal thành công */
  is_success_open: boolean
  /** Loại thanh toán */
  payment_type: PAYMENT_TYPE
  /** txn meta */
  meta: ITxnMeta
}>()
/** Loại thanh toán
 * PAGE = Mua thêm trang
 * STAFF = Mua thêm nhân viên
 * PACKAGE = Nâng cấp gói
 * TOKEN = Mua thêm token
 */
type PAYMENT_TYPE = 'PAGE' | 'STAFF' | 'PACKAGE' | 'TOKEN'
/** Common store */
const commonStore = useCommonStore()
/** Org store */
const orgStore = useOrgStore()
/** Hàm dịch i18n */
const { t: $t } = useI18n()
/** call back hàm close và confirm */
const emit = defineEmits(['close', 'confirm'])

/** state nội bộ trong modal */
const voucher_code = ref('')
/** Trạng thái xuất hóa đơn */
const is_issue_invoice = ref(false)
/** Trạng thái kiểm tra thanh toán */
const verify_voucher = ref<any>({})
/** Thông tin giao dịch */
const txn_info = ref<any>({})
/** Trạng thái kiểm tra thanh toán lấy từ file cha */
const check_payment = defineModel<Boolean>('check_payment')

/**phương thức thanh toán đang chọn */
const payment_method = ref<TransactionInfo['txn_payment_method']>('TRANSFER')

/**bước thanh toán */
const pay_step = ref<'STEP_1' | 'STEP_2'>('STEP_1')

function handleClose() {
  /** gọi hàm cha */
  props.closeConfirmModal()
  /** set step = 1 */
  pay_step.value = 'STEP_1'
}

/**các phương thức thanh toán */
const LIST_PAYMENT_METHOD: {
  title: string
  value: TransactionInfo['txn_payment_method']
  disabled?: boolean
}[] = [
  {
    title: $t('v1.view.main.dashboard.org.pay.recharge.transfer'),
    value: 'TRANSFER',
  },
  // {
  //   title: $t('v1.view.main.dashboard.org.pay.recharge.vnpay'),
  //   value: 'VNPAY',
  //   disabled: true,
  // },
  // {
  //   title: $t('v1.view.main.dashboard.org.pay.recharge.zalopay'),
  //   value: 'ZALO_PAY',
  //   disabled: true,
  // },
  // {
  //   title: $t('v1.view.main.dashboard.org.pay.recharge.momo'),
  //   value: 'MOMO',
  //   disabled: true,
  // },
  // {
  //   title: $t('v1.view.main.dashboard.org.pay.recharge.card'),
  //   value: 'CARD',
  //   disabled: true,
  // },
]

/** Hàm debounce kiểm tra mã giảm giá */
const DEBOUNCE_VERIFY_VOUCHER = debounce(verifyVoucher, 300)
/**kiểm tra mã giảm giá */
async function verifyVoucher() {
  try {
    /** nếu không có mã giảm giá thì thôi */
    if (!voucher_code.value) {
      /** xoá mã thì đánh dấu là hợp lệ */
      verify_voucher.value = {}
      /** return luôn */
      return
    }

    /** kích hoạt trạng thái loading */
    orgStore.is_loading = true

    /**kết quả trả về */
    verify_voucher.value = await new BillingAppVoucher().verifyVoucher(
      Number(props.amount),
      voucher_code.value
    )
  } catch (e) {
  } finally {
    /** tắt trạng thái loading */
    orgStore.is_loading = false
  }
}
/** Hàm tính toán hiển thị text sau khi nhập mã thành công
 * @param original_price giá gốc
 * @param new_price giá sau khi add voucher
 */
function getPriceChangeText(original_price: number, new_price: number): string {
  /** Tính toán chenh lệch */
  const DIFF_AMOUNT = new_price - original_price
  /** Nếu tí hơn là giảm giá */
  if (DIFF_AMOUNT < 0) {
    return `${$t('v1.view.main.dashboard.org.pay.upgrade.pay_less')} ${Math.abs(
      DIFF_AMOUNT
    ).toLocaleString()}đ`
    /** Nếu nhiều hơn là tăng giá */
  } else if (DIFF_AMOUNT > 0) {
    return `${$t(
      'v1.view.main.dashboard.org.pay.upgrade.pay_more'
    )} ${DIFF_AMOUNT.toLocaleString()}đ`
  } else {
    return ''
  }
}
/**tính ra số tiền chính xác cần quét qr */
function calcBankAmount(): string {
  /** nếu không có mã giảm giá thì thôi */
  if (!size(verify_voucher.value)) return props.amount

  /**số tiền mới */
  const NEW_AMOUNT = String(verify_voucher.value?.txn_origin_amount)

  /** nếu tăng thì giữ nguyên số tiền */
  if (props.amount == NEW_AMOUNT) return props.amount
  /** nếu giảm thì lấy số tiền gốc mới */ else return NEW_AMOUNT
}

/**tạo mới giao dịch */
async function createTxn() {
  /** nếu chưa chọn tổ chức nào thì không thực hiện */
  if (
    !orgStore.selected_org_id ||
    orgStore.is_loading ||
    verify_voucher.value?.is_verify === false
  )
    return

  /** kích hoạt trạng thái loading */
  orgStore.is_loading = true

  try {
    /**số tiền nạp */
    const AMOUNT = Number(props.amount) - props.wallet_balance

    // const AMOUNT = 4000

    /** kiểm tra số tiền nạp có hợp lệ không */
    // if (!AMOUNT || AMOUNT < 50000 || AMOUNT > 250000000)
    if (!AMOUNT || AMOUNT > 250000000)
      throw $t('v1.view.main.dashboard.org.pay.recharge.amount_description')

    /**lấy thông tin ví hiện tại */
    const WALLET_INFO = await read_wallet(orgStore.selected_org_id)

    /**id ví */
    const WALLET_ID = WALLET_INFO?.wallet_id

    /** kiểm tra ví có tồn tại không */
    if (!WALLET_ID)
      throw $t('v1.view.main.dashboard.org.pay.recharge.wrong_wallet_id')
    /** Check type, nếu mua gói thì hiện tiền, ngược lại là số mua thêm */

    props.meta.quantity = Number(props.SELECTED) || 1

    /** tạo giao dịch */
    txn_info.value = await create_txn(
      orgStore.selected_org_id,
      WALLET_ID,
      AMOUNT,
      payment_method.value,
      is_issue_invoice.value,
      voucher_code.value,
      props.meta
    )

    /** chuyển sang bước 2 */
    pay_step.value = 'STEP_2'
  } catch (e) {
    /** hiển thị thông báo lỗi */
    toastError(e)
  }

  /** tắt trạng thái loading */
  orgStore.is_loading = false
}

/** render tên package
 * @param package_name tên gói
 */
const renderPackageName = (package_name?: string) => {
  /** Trả ra tên gói tương ứng */
  if (package_name === 'LITE') return $t('v1.view.main.dashboard.org.pay.lite')
  if (package_name === 'PRO') return $t('v1.view.main.dashboard.org.pay.pro')
  if (package_name === 'BUSINESS')
    return $t('v1.view.main.dashboard.org.pay.business')
}
/** KHai báo toast */
const $toast = container.resolve(Toast)

/**có kích hoat chế độ sửa không */
const is_edit = ref(false)
/**dữ liệu trước khi sửa */
const old_info = ref<OrgInfo['org_info']>({})
console.log(orgStore, 'org_store')
/** Hàm theo dõi thông tin org */
const org_info = computed({
  get() {
    return orgStore.selected_org_info?.org_info || {}
  },
  set(val) {
    set(orgStore, 'selected_org_info.org_info', val)
  },
})

class Main {
  activeEdit() {
    old_info.value = copy(org_info.value)
    is_edit.value = true
  }
  cancelEdit() {
    if (orgStore.is_loading) return
    org_info.value = copy(old_info.value || {})
    is_edit.value = false
  }
  @loading(toRef(orgStore, 'is_loading'))
  @error($toast)
  async save() {
    if (!orgStore.selected_org_id) return
    await update_org(orgStore.selected_org_id, { org_info: org_info.value })
    is_edit.value = false
    $toast.success($t('v1.common.update_success'))
  }
}
const $main = new Main()
</script>
