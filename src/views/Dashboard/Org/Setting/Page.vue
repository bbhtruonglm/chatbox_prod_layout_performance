<template>
  <CardItem>
    <template #icon>
      <StackIcon class="w-5 h-5" />
    </template>
    <template #title>
      {{ $t('v1.common.page') }}
      (
      {{ orgStore.selected_org_info?.org_package?.org_current_page }}
      /
      <template v-if="orgStore.isUnlimitedPage()"> ∞ </template>
      <template v-else>
        {{ orgStore.selected_org_info?.org_package?.org_quota_page }}
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
            v-model="search_page"
            type="text"
            class="border rounded-full py-1.5 pl-8 px-3 outline-none"
            :placeholder="$t('Tìm kiếm')"
          />
        </div>
        <button
          @click="openAddPageModal"
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
        <template v-for="os of orgStore.list_os">
          <PageItem
            v-if="os?.page_info"
            :page_info="os?.page_info"
            :checkbox_is_visible="false"
            class="cursor-pointer"
            v-show="showPage(os?.page_info)"
          >
            <template #after-name>
              <div
                @click.stop="prepareInactivePage(os?.page_info)"
                v-tooltip="$t('v1.view.main.dashboard.select_page.cancel_page')"
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
          </PageItem>
        </template>
      </div>
    </template>
  </CardItem>
  <ConfirmInactive
    @done="doneInactivePage"
    :selected_page
    ref="confirm_inactive_modal_ref"
  />
  <ConnectPage
    @done="getOs()"
    ref="connect_page_ref"
  />
</template>
<script setup lang="ts">
import { read_os } from '@/service/api/chatbox/billing'
import { toastError } from '@/service/helper/alert'
import { nonAccentVn } from '@/service/helper/format'
import { useOrgStore } from '@/stores'
import { remove } from 'lodash'
import { onMounted, ref, watch } from 'vue'

import CardItem from '@/components/Main/Dashboard/CardItem.vue'
import PageItem from '@/components/Main/Dashboard/PageItem.vue'

import ConnectPage from '@/views/Dashboard/ConnectPage.vue'
import ConfirmInactive from '@/views/Dashboard/Org/Setting/Page/ConfirmInactive.vue'

import MinusIcon from '@/components/Icons/Minus.vue'
import MinusOutlineIcon from '@/components/Icons/MinusOutline.vue'
import StackIcon from '@/components/Icons/Stack.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

import type { IPage } from '@/service/interface/app/page'

const orgStore = useOrgStore()

/**modal xác nhận huỷ trang */
const confirm_inactive_modal_ref = ref<InstanceType<typeof ConfirmInactive>>()
/**page đang được chọn */
const selected_page = ref<IPage>()
/**danh sách trang trong tổ chức */
// const list_os = ref<OwnerShipInfo[]>()
/**ref của modal kết nối nền tảng */
const connect_page_ref = ref<InstanceType<typeof ConnectPage>>()
/** từ khóa tìm kiếm trang */
const search_page = ref('')

// nạp dữ liệu trang khi component được mount
onMounted(getOs)
// nạp dữ liệu trang khi tổ chức được chọn
watch(() => orgStore.selected_org_id, getOs)

/** ẩn hiện trang */
function showPage(page: IPage) {
  /** từ khóa tìm kiếm */
  const SEARCH = nonAccentVn(search_page.value)?.replace(/ /g, '')
  /** tên page */
  const FULL_NAME = nonAccentVn(page?.alias || page?.name || '')?.replace(/ /g, '')
  /** id của page */
  const ID_PAGE = page?.fb_page_id?.replace(/ /g, '') || ''
  
  // nếu tên hoặc id chứa từ khóa thì hiển thị
  return FULL_NAME.includes(SEARCH) || ID_PAGE.includes(SEARCH)
}

/**chuẩn bị huỷ kích hoạt trang */
function prepareInactivePage(page?: IPage) {
  // chọn trang
  selected_page.value = page

  // hiển thị alert cảnh báo
  confirm_inactive_modal_ref.value?.toggleModal()
}
/**hoàn thành việc huỷ kích hoạt trang */
async function doneInactivePage() {
  // xoá trang khỏi danh sách trang đang chọn
  remove(
    orgStore.list_os || [],
    os => os?.page_info?.fb_page_id === selected_page.value?.fb_page_id
  )

  // xoá trang đang chọn
  selected_page.value = undefined
}
/**lấy danh sách trang của tổ chức này */
async function getOs() {
  // nếu chưa chọn tổ chức thì thôi
  if (!orgStore.selected_org_id) return

  // bật loading
  orgStore.is_loading = true

  try {
    // lấy danh sách trang của tổ chức
    orgStore.list_os = await read_os(orgStore.selected_org_id)
    // list_os.value = await read_os(orgStore.selected_org_id)

    // ghi đè lại tổng số trang hiện tại
    if (orgStore.selected_org_info?.org_package)
      orgStore.selected_org_info.org_package.org_current_page =
        orgStore.list_os.length
  } catch (e) {
    // thông báo lỗi
    toastError(e)
  }

  // tắt loading
  orgStore.is_loading = false
}
/**mở modal thêm trang */
function openAddPageModal() {
  // mở modal thêm trang
  connect_page_ref.value?.toggleModal('PAGE')
}
</script>
