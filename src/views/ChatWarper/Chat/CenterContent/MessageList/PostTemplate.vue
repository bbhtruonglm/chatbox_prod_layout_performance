<template>
  <div
    id="chat__post-template"
    class="flex flex-col gap-1 py-2"
  >
    <div
      v-if="message?.ad_id"
      class="text-xs text-right"
    >
      <span class="text-slate-500 whitespace-nowrap mr-1">
        {{ $t('v1.view.main.dashboard.chat.post.ad_from') }}
      </span>
      <span
        @click="$clipboard.copy(message?.ad_id)"
        class="text-blue-500 cursor-copy"
        >{{ message?.ad_id }}</span
      >
    </div>
    <div
      class="bg-white shadow-sm rounded-lg relative overflow-x-auto max-w-96"
    >
      <Loading
        v-if="is_loading"
        type="FULL"
      />
      <div class="flex gap-2 p-2 flex-col w-96">
        <PostInfo
          :message
          :message_index
          is_show_btn_comment
        />
        <div class="flex flex-col gap-1">
          <MainComment
            :message
            :message_index
            v-model:is_loading="is_loading"
          />
          <div
            v-for="comment of $props.message?.reply_comments?.slice(0, 2)"
            :key="comment.comment_id"
            class="flex flex-col"
          >
            <div class="flex items-center">
              <CornerDownRightIcon
                class="w-5 h-5 text-slate-500 flex-shrink-0"
              />
              <p class="flex-grow comment-item">
                {{ comment?.message }}
              </p>
            </div>
            <div class="flex items-center text-xxs ml-6 gap-1">
              <p class="font-medium truncate">
                {{ comment?.from?.name }}
              </p>
              <div class="w-1 h-1 flex-shrink-0 bg-black rounded-full" />
              <p class="text-slate-700 flex-shrink-0">
                {{ $main.commentDuration(comment?.createdAt) }}
              </p>
            </div>
          </div>
        </div>
        <div
          v-if="!message?.ad_id && message?.comment_id"
          class="flex items-center text-xs gap-2 justify-start"
        >
          <button
            @click="$main.replyComment('REPLY')"
            class="btn"
          >
            <ChatDotIcon class="icon" />
            {{ $t('v1.view.main.dashboard.chat.post.reply_comment') }}
          </button>
          <button
            v-if="!message?.is_hidden_comment"
            @click="$main.toggleComment('HIDE')"
            class="btn"
          >
            <EyeSlashIcon class="icon" />
            {{ $t('v1.view.main.dashboard.chat.post.hide_comment') }}
          </button>
          <button
            v-if="!message?.is_private_reply"
            @click="$main.replyComment('PRIVATE_REPLY')"
            class="btn"
          >
            <PaperAirplaneIcon class="icon" />
            {{ $t('v1.view.main.dashboard.chat.post.private_inbox') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useConversationStore, useMessageStore } from '@/stores'
import { container } from 'tsyringe'
import { DateHandle } from '@/utils/helper/DateHandle'
import { N4SerivceAppPost } from '@/utils/api/N4Service/Post'
import { error } from '@/utils/decorator/Error'
import { loadingV2 } from '@/utils/decorator/Loading'
import { Clipboard } from '@/utils/helper/Clipboard'
import { composableService } from '@/views/ChatWarper/Chat/CenterContent/MessageList/PostTemplate/service'

import Loading from '@/components/Loading.vue'
import PostInfo from '@/views/ChatWarper/Chat/CenterContent/MessageList/PostTemplate/PostInfo.vue'
import MainComment from '@/views/ChatWarper/Chat/CenterContent/MessageList/PostTemplate/MainComment.vue'

import EyeSlashIcon from '@/components/Icons/EyeSlash.vue'
import CornerDownRightIcon from '@/components/Icons/CornerDownRight.vue'
import ChatDotIcon from '@/components/Icons/ChatDot.vue'
import PaperAirplaneIcon from '@/components/Icons/PaperAirplane.vue'

import type {
  IReplyCommentType,
  MessageInfo,
} from '@/service/interface/app/message'

const { PostService } = composableService()

const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const $clipboard = container.resolve(Clipboard)

const $props = withDefaults(
  defineProps<{
    /**dữ liệu tin nhắn */
    message?: MessageInfo
    /**vị trí của tin nhắn */
    message_index?: number
  }>(),
  {}
)

/**trạng thái loading */
const is_loading = ref(false)

class Main {
  /**
   * @param API_POST API lấy dữ liệu bài post
   * @param SERVICE_DATE_HANDLE xử lý thời gian
   * @param SERVICE_POST xử lý logic bài viết
   */
  constructor(
    private readonly API_POST: N4SerivceAppPost = container.resolve(
      N4SerivceAppPost
    ),
    private readonly SERVICE_DATE_HANDLE: DateHandle = container.resolve(
      DateHandle
    ),
    private readonly SERVICE_POST = container.resolve(PostService)
  ) {}

  /**ẩn bình luận */
  @loadingV2(is_loading, 'value')
  @error()
  async toggleComment(type: 'HIDE' | 'SHOW') {
    // thực thi
    await this.SERVICE_POST.toggleComment(type, $props.message)
  }
  /**lấy một số comment mới nhất */
  @error()
  async getReplyComment(is_force?: boolean): Promise<void> {
    if (!conversationStore.select_conversation?.fb_page_id) return
    if (!conversationStore.select_conversation?.fb_client_id) return
    if (!$props.message?.comment_id) return

    // nếu đã có dữ liệu thì không cần lấy nữa
    if ($props.message.reply_comments?.length && !is_force) return

    // lấy vài comment mới nhất
    $props.message.reply_comments = await this.API_POST.getMainComment(
      conversationStore.select_conversation?.fb_page_id,
      conversationStore.select_conversation?.fb_client_id,
      $props.message?.comment_id,
      0,
      2
    )
  }
  /**
   * khoản thời gian từ lúc tạo đến bây giờ
   * @param created_at thời gian tạo bình luận
   */
  commentDuration(created_at?: string): string {
    return this.SERVICE_DATE_HANDLE.calcDuration(
      created_at,
      // so sánh với hiện tại
      Date.now(),
      // thêm ago vào cuối
      { addSuffix: true }
    )
  }
  /**kích hoạt trả lời bình luận này */
  replyComment(type: IReplyCommentType) {
    // nếu đang loading thì không cho phép trả lời
    if (messageStore.reply_comment?.is_loading) return

    // lưu thông tin bình luận
    messageStore.reply_comment = {
      type,
      root_comment_id: $props.message?.comment_id,
      root_comment_message: $props.message?.message_text,
      message_index: $props.message_index,
      post_id: $props.message?.fb_post_id,
    }

    // focus vào input chat
    document.getElementById('chat-text-input-message')?.focus()
  }
}
const $main = new Main()

// lấy dữ liệu bình luận khi component được mount
onMounted(() => $main.getReplyComment())

// khi có người rep lại bình luận, thì cập nhật
watch(
  () => $props.message?.comment?.comment_id,
  () => $main.getReplyComment(true)
)
</script>
<style lang="scss" scoped>
@import '@/views/ChatWarper/Chat/CenterContent/MessageList/PostTemplate/style.scss';
</style>
