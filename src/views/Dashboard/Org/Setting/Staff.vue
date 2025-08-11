<template>
  <CardItem>
    <template #icon>
      <UsersIcon class="w-5 h-5" />
    </template>
    <template #title>
      {{ $t('v1.view.main.dashboard.org.setting.member') }}
      (
      {{ orgStore.selected_org_info?.org_package?.org_current_staff }}
      /
      <template v-if="orgStore.isUnlimitedStaff()"> ∞ </template>
      <template v-else>
        {{ orgStore.selected_org_info?.org_package?.org_quota_staff }}
      </template>
      )
    </template>
    <template #action>
      <div class="flex items-center gap-2 text-sm">
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute top-0 bottom-0 left-3 m-auto size-4 text-slate-500"
          />
          <input
            v-model="search_employee"
            type="text"
            class="border rounded-full py-1.5 pl-8 px-3 outline-none"
            :placeholder="$t('Tìm kiếm')"
          />
        </div>
        <button
          @click="activeStaff"
          class="py-1 px-4 rounded-md font-medium bg-blue-600 text-white"
        >
          {{ $t('v1.common.more') }}
        </button>
      </div>
    </template>
    <template #item>
      <div
        class="grid gap-6 grid-cols-1 md:grid-cols-4 max-h-[50dvh] overflow-auto"
      >
        <template v-for="staff of orgStore.list_ms">
          <ActorItem
            v-show="showEmployee(staff)"
            @click="activeMs(staff)"
            :class="{
              'opacity-50': !staff.ms_is_active,
            }"
            class="cursor-pointer"
          >
            <template #avatar>
              <StaffAvatar
                :id="staff?.user_info?.user_id"
                class="w-8 h-8 rounded-oval"
              />
            </template>
            <template #name>
              {{ staff?.user_info?.full_name }}
            </template>
            <template #after-name>
              <div
                @click.stop="prepareInactiveStaff(staff)"
                v-tooltip="
                  $t('v1.view.main.dashboard.org.setting.remove_staff')
                "
                class="group/minus hidden group-hover:flex"
              >
                <MinusOutlineIcon
                  class="w-4 h-4 text-slate-500 group-hover/minus:hidden"
                />
                <MinusIcon
                  class="w-4 h-4 text-slate-900 hidden group-hover/minus:block"
                />
              </div>
            </template>
            <template #description>
              <div class="text-xs text-slate-500 flex-grow truncate min-w-0">
                <template v-if="$member_ship_helper.isAdmin(staff)">
                  {{ $t('v1.view.main.dashboard.org_staff.admin') }}
                </template>
                <template v-else>
                  {{ $t('v1.view.main.dashboard.org_staff.member') }}
                </template>
                -
                {{ staff?.staff_id }}
              </div>
            </template>
          </ActorItem>
        </template>
      </div>
    </template>
  </CardItem>
  <ConfirmInactive
    @done="doneInactiveStaff"
    :selected_staff
    ref="confirm_inactive_modal_ref"
  />
  <ConnectPage
    @done="readMs()"
    ref="connect_page_ref"
  />
</template>
<script setup lang="ts">
import { useOrgStore } from '@/stores'
import { onMounted, ref, watch } from 'vue'
import { toastError } from '@/service/helper/alert'
import { read_ms } from '@/service/api/chatbox/billing'
import { formatDistanceToNow } from 'date-fns'
import vi from 'date-fns/locale/vi'
import { remove } from 'lodash'
import { SingletonMemberShipHelper } from '@/utils/helper/Billing/MemberShip'

import CardItem from '@/components/Main/Dashboard/CardItem.vue'
import StaffAvatar from '@/components/Avatar/StaffAvatar.vue'
import ActorItem from '@/components/Main/Dashboard/ActorItem.vue'
import ConfirmInactive from '@/views/Dashboard/Org/Setting/Staff/ConfirmInactive.vue'
import ConnectPage from '@/views/Dashboard/ConnectPage.vue'

import MinusOutlineIcon from '@/components/Icons/MinusOutline.vue'
import MinusIcon from '@/components/Icons/Minus.vue'
import UsersIcon from '@/components/Icons/Users.vue'

import type { MemberShipInfo } from '@/service/interface/app/billing'
import { ToastSingleton } from '@/utils/helper/Alert/Toast'
import { ConfirmSingleton } from '@/utils/helper/Alert/Confirm'
import { useI18n } from 'vue-i18n'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { nonAccentVn } from '@/service/helper/format'

const orgStore = useOrgStore()
const $member_ship_helper = SingletonMemberShipHelper.getInst()
const $toast = ToastSingleton.getInst()
const $confirm = ConfirmSingleton.getInst()
const { t: $t } = useI18n()

/**modal xác nhận huỷ trang */
const confirm_inactive_modal_ref = ref<InstanceType<typeof ConfirmInactive>>()
/**danh sách thành viên */
// const list_ms = ref<MemberShipInfo[]>()
/**nhân viên đang được chọn */
const selected_staff = ref<MemberShipInfo>()
/**ref của modal kết nối nền tảng */
const connect_page_ref = ref<InstanceType<typeof ConnectPage>>()
/** từ khóa tìm kiếm nhân sự */
const search_employee = ref('')

// nạp danh sách nhân viên khi component được mount
onMounted(readMs)
// nạp danh sách nhân viên khi chọn tổ chức khác
watch(() => orgStore.selected_org_id, readMs)

/** ẩn hiện nhân sự */
function showEmployee(ms: MemberShipInfo) {
  /** từ khóa tìm kiếm */
  const SEARCH = nonAccentVn(search_employee.value)?.replace(/ /g, '')
  /** tên đầy đủ của nhân sự */
  const FULL_NAME = nonAccentVn(ms.user_info?.full_name || '')?.replace(
    / /g,
    ''
  )
  /** id của nhân sự */
  const ID_STAFF = ms?.staff_id?.replace(/ /g, '') || ''

  // nếu tên hoặc id chứa từ khóa thì hiển thị
  return FULL_NAME.includes(SEARCH) || ID_STAFF.includes(SEARCH)
}

/**kích hoạt nhân viên đang chờ */
async function activeMs(staff: MemberShipInfo) {
  try {
    // nếu nhân viên đã kích hoạt thì thôi
    if (staff.ms_is_active) return

    /**có chắc chắn muốn kích hoạt khôg */
    const IS_CONFIRM = await $confirm.question(
      $t('v1.view.main.dashboard.org.setting.active_staff.title'),
      $t('v1.view.main.dashboard.org.setting.active_staff.description')
    )

    // nếu không chắc chắn thì thôi
    if (!IS_CONFIRM) return

    // bật loading
    orgStore.is_loading = true

    // kích hoạt nhân viên
    await $member_ship_helper.activeStaff(staff)

    // lấy lại danh sách nhân viên mới
    readMs()

    // thông báo thành công
    $toast.success($t('v1.common.success'))
  } catch (e) {
    // thông báo lỗi
    $toast.error(e)
  } finally {
    // tắt loading
    orgStore.is_loading = false
  }
}
/**chuẩn bị huỷ kích hoạt nhân viên */
function prepareInactiveStaff(ms?: MemberShipInfo) {
  // chọn nhân viên
  selected_staff.value = ms

  // hiển thị alert cảnh báo
  confirm_inactive_modal_ref.value?.toggleModal()
}
/**hoàn thành việc huỷ kích hoạt nhân viên */
async function doneInactiveStaff() {
  // xoá nhân viên khỏi danh sách nhân viên đang chọn
  remove(
    orgStore.list_ms || [],
    os => os?.staff_id === selected_staff.value?.staff_id
  )

  // xoá trang đang chọn
  selected_staff.value = undefined
}
/**mở modal thêm nhân viên */
function activeStaff() {
  // mở modal thêm nhân viên
  connect_page_ref.value?.toggleModal('MEMBER')
}
/**khoảng thời gian trước đó đến hiện tại là bao nhiêu */
function timeAgo(date?: string): string {
  // nếu không có date thì trả về rỗng
  if (!date) return ''

  // trả về khoảng cách giữa date và hiện tại
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}
/**đọc danh sách thành viên của tổ chức */
async function readMs() {
  // nếu chưa chọn org thì thôi
  if (!orgStore.selected_org_id) return

  // bật loading
  orgStore.is_loading = true

  try {
    // lấy danh sách thành viên
    orgStore.list_ms = await read_ms(orgStore.selected_org_id)

    // ghi đè lại tổng số nhân viên hiện tại
    if (orgStore.selected_org_info?.org_package)
      orgStore.selected_org_info.org_package.org_current_staff =
        orgStore.list_ms?.filter(ms => ms?.ms_is_active).length
  } catch (e) {
    // thông báo lỗi
    toastError(e)
  }

  // tắt loading
  orgStore.is_loading = false
}
</script>
