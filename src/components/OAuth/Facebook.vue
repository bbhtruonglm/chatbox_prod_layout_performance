<template>
  <div class="relative">
    <div
      v-if="is_loading"
      class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-10"
    >
      <Loading />
    </div>
    <iframe
      @load="removeLoading"
      loading="lazy"
      class="relative z-[2] w-full h-full"
      v-if="iframe_src"
      :src="iframe_src"
      title="Facebook Login"
      frameborder="0"
    />
  </div>
</template>
<script setup lang="ts">
import { container } from 'tsyringe'
import { onMounted, onUnmounted, ref } from 'vue'
import { CROSS_LOGIN_URL } from '@/configs/constants/botbanhang'
import { TriggerEventRef } from '@/utils/helper/TriggerEventRef'
// import { cross_login_url } from '@/service/constant/botbanhang'

import Loading from '../Loading.vue'

const $emit = defineEmits(['access_token'])

const $props = withDefaults(
  defineProps<{
    /**nội dung hiển thị trên button */
    text?: string
    /**scoped của fb được truyền vào */
    option?: string
    /**app id của fb */
    app_id?: string
    /**custom css thêm cho button */
    btn_style?: string
  }>(),
  {}
)

const $trigger_event_ref = container.resolve(TriggerEventRef)

/**url của iframe */
const iframe_src = ref('')
/**có hiển thị loading hay không */
const is_loading = ref(true)

/**tắt loading khi iframe load thành công */
function removeLoading() {
  is_loading.value = false
}
/**
 * - do fb bị lỗi không thêm mới được white domain, nên phải đăng nhập thông qua
 * iframe của bot bán hàng, sau đó send event ra ngoài
 * - hàm này nhận data được gửi từ iframe
 */
function getFacebookToken(
  $event: MessageEvent<{
    data: {
      authResponse: {
        accessToken: string
        userID: string
      }
    }
    from: 'FACEBOOK_IFRAME'
    event: 'LOGIN'
  }>
) {
  // chỉ xử lý các data được gửi từ iframe bbh với event là login
  if (
    !$event ||
    !$event.data ||
    !$event.data.data ||
    $event.data.from !== 'FACEBOOK_IFRAME' ||
    $event.data.event !== 'LOGIN'
  )
    return

  const FACEBOOK_RESPONSE = $event.data.data

  if (
    !FACEBOOK_RESPONSE.authResponse ||
    !FACEBOOK_RESPONSE.authResponse.accessToken
  )
    return

  $emit('access_token', FACEBOOK_RESPONSE.authResponse.accessToken)

  // trigger message tới nhân viên
  $trigger_event_ref.sendMessageLoginFacebook()
}
/**khởi tạo url và các option của iframe */
function genIframeSrc() {
  const APP_ID = $env.facebook.app_id
  let login_option = {
    ...$env.facebook.login_option,
    scope: $env.facebook.permissions.join(),
  }
  const FB_OPTION = JSON.stringify(login_option)

  /**đường dẫn */
  let url = `${CROSS_LOGIN_URL}?app_id=${$props.app_id || APP_ID}&option=${
    $props.option || FB_OPTION
  }&text=${$props.text || ''}`

  // custom css cho button nếu có
  if ($props.btn_style)
    url += `&btn_style=${encodeURIComponent($props.btn_style)}`

  // gán url vào iframe
  iframe_src.value = url
}

onMounted(() => {
  // lắng nghe iframe gửi dữ liệu
  window.addEventListener('message', getFacebookToken)

  // khởi tạo url của irame
  genIframeSrc()
})
// huỷ sự kiện lắng nghe khi un mount component này
onUnmounted(() => window.removeEventListener('message', getFacebookToken))
</script>
