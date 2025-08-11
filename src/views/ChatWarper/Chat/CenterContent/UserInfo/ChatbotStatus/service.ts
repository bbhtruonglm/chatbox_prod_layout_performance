import { N4SerivceAppConversation } from '@/utils/api/N4Service/Conversation'
import { useCommonStore, useConversationStore } from '@/stores'
import { error } from '@/utils/decorator/Error'
import { loadingV2 } from '@/utils/decorator/Loading'
import { Toast, ToastV2 } from '@/utils/helper/Alert/Toast'
import { DateHandle } from '@/utils/helper/DateHandle'
import { container } from 'tsyringe'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ConversationInfo } from '@/service/interface/app/conversation'
import type {
  IAgentWorkingHour,
  IBusinessHourConfig,
} from '@/service/interface/app/page'

/**
 * thiết lập tắt bật chatbot của khách hàng
 * @param without_watch không lắng nghe chuyển hội thoại
 */
export function composableService(without_watch: boolean = false) {
  const conversationStore = useConversationStore()
  const commonStore = useCommonStore()
  const { t: $t } = useI18n()
  const $toast = container.resolve(ToastV2)
  const $date_handle = container.resolve(DateHandle)

  class Main {
    /**
     * @param API gọi API
     */
    constructor(
      private readonly API = container.resolve(N4SerivceAppConversation)
    ) {}

    /**tắt bật chatbot */
    @loadingV2(commonStore, 'is_loading_full_screen')
    @error()
    async manageChatbot(status: boolean, bot_resume_after?: number) {
      // xác thực dữ liệu
      if (!conversationStore.select_conversation?.fb_page_id) return
      if (!conversationStore.select_conversation?.fb_client_id) return

      // thao tác chatbot

      /**kết quả */
      const RES = await this.API.manageChatbot(
        conversationStore.select_conversation?.fb_page_id,
        conversationStore.select_conversation?.fb_client_id,
        status,
        bot_resume_after
      )

      // ghi lại dữ liệu mới
      conversationStore.select_conversation.bot_resume_at = RES?.bot_resume_at

      /** Data key của hội thoại đang được chọn */
      const DATA_KEY = conversationStore.select_conversation?.data_key || ''

      // cập nhật dữ liệu ở danh sách hội thoại
      conversationStore.conversation_list[DATA_KEY].bot_resume_at =
        RES?.bot_resume_at

      // cảnh báo khi bot tắt
      if (status) this.alertDisableChatbot()
    }

    /** cảnh báo khi bot tắt */
    alertDisableChatbot() {
      /** giờ bot bật */
      const DATE_RESUME_AT = $date_handle.format(
        conversationStore.select_conversation?.bot_resume_at,
        'hh:mm'
      )

      /** khoảng thời gian tắt */
      const DURATION = $date_handle.calcDuration(
        conversationStore.select_conversation?.bot_resume_at,
        // so sánh với hiện tại
        Date.now(),
        // thêm ago vào cuối
        { addSuffix: true }
      )

      /** nội dung thông báo */
      let alert_message = ''

      // nếu khoảng thời gian là 9999 năm => tắt đến khi bật lại
      if (DURATION?.includes('9999')) {
        alert_message = $t('Trợ lý AI được tắt.')
      } else {
        /** nội dung thông báo */
        alert_message = $t(
          'Trợ lý AI đã tắt. Trợ lý AI sẽ tự động bật lại sau _ (lúc _)',
          { date: DATE_RESUME_AT, duration: DURATION }
        )
      }

      // cảnh báo
      $toast.warning(alert_message, 'top-center', 3_000)
    }

    /**
     * tính toán trạng thái
     * @deprecated đã cũ đổi sang dùng calcStatusNew
     */
    calcStatus(time?: number): boolean {
      // nếu không có -> bot bật
      if (!time) return true

      // nếu chưa đến giờ -> bot tắt
      if (time > Date.now()) return false

      // đã đến giờ -> bot bật
      return true
    }

    /** kiểm tra có trước thời điểm hiện tại không */
    isBeforeNow(hour: number = 0, minute: number = 0): boolean {
      /** thời gian hiện tại */
      const NOW = new Date()

      /** thời gian được chỉ định */
      const TAGET_TIME = new Date()

      // đặt giờ và phút đúng với dữ liệu được truyền vào
      TAGET_TIME.setHours(hour, minute, 0, 0)

      // nếu là trước thời điểm hiện tại
      return NOW < TAGET_TIME
    }

    /** hàm kiểm tra có đang trong giờ hành chính không */
    isInBusinessHour(business_hour_config: IBusinessHourConfig = {}): boolean {
      // nếu luôn đóng -> không trong giờ hành chính
      if (business_hour_config.type === 'CLOSE') return false

      // nếu theo khung giờ
      if (business_hour_config.type === 'TIME_SLOT') {
        /** thời gian hiện tại */
        const NOW = new Date()

        /** ngày thứ của thời điểm hiện tại */
        const DAY_OF_WEEK = NOW.getDay().toString() as keyof NonNullable<
          IBusinessHourConfig['source']
        >

        /** dữ liệu thiết lập của ngày hiện tại */
        const DAY_OF_WEEK_CONFIG = business_hour_config.source?.[DAY_OF_WEEK]

        // nếu hôm nay không làm => không trong giờ hành chính
        if (DAY_OF_WEEK_CONFIG?.is_disable) return false

        /** giờ bắt đầu làm việc */
        const START_HOUR = DAY_OF_WEEK_CONFIG?.start_time?.hour

        /** phút bắt đầu làm việc */
        const START_MINUTE = DAY_OF_WEEK_CONFIG?.start_time?.minute

        /** giờ kết thúc làm việc */
        const END_HOUR = DAY_OF_WEEK_CONFIG?.end_time?.hour

        /** phút kết thúc làm việc */
        const END_MINUTE = DAY_OF_WEEK_CONFIG?.end_time?.minute

        // nếu hiện trước giờ bắt đầu làm việc -> không trong giờ hành chính
        if (this.isBeforeNow(START_HOUR, START_MINUTE)) return false

        // nếu hiện tại đã qua giờ kết thúc làm việc -> không trong giờ hành chính
        if (!this.isBeforeNow(END_HOUR, END_MINUTE)) return false

        return true
      }

      return false
    }

    /** hàm lấy dữ liệu thiết lập AI */
    getAiAgentWorkingHourAnswer(
      conversation?: ConversationInfo
    ): IAgentWorkingHour | undefined {
      /** dữ liệu trang của hội thoại truyền vào */
      const PAGE = conversationStore.getPageById(conversation?.fb_page_id || '')
      /** dữ liệu thiết lập giờ làm việc */
      const BUSINESS_HOUR_CONFIG = PAGE?.business_hour_config

      /** dữ liệu thiết lập ai trả lời */
      let ai_agent_working_hour_answer: IAgentWorkingHour | undefined

      // nếu đang trong giờ hàng chính
      if (this.isInBusinessHour(BUSINESS_HOUR_CONFIG)) {
        ai_agent_working_hour_answer =
          PAGE?.ai_agent_working_hour_answer?.in_working_hour
      } else {
        ai_agent_working_hour_answer =
          PAGE?.ai_agent_working_hour_answer?.out_working_hour
      }

      return ai_agent_working_hour_answer
    }

    /** tính toán trạng thái */
    calcStatusNew(conversation?: ConversationInfo): boolean {
      /** thời gian mà bot bật trở lạis */
      const BOT_RESUME_TIME = conversation?.bot_resume_at

      /** dữ liệu thiết lập ai trả lời */
      const AI_AGENT_WORKING_HOUR_ANSWER =
        this.getAiAgentWorkingHourAnswer(conversation)

      // nếu trong thiết lập tắt AI trả lời -> bot tắt
      if (AI_AGENT_WORKING_HOUR_ANSWER?.type === 'NOT_ANSWER') return false

      // nếu không có -> bot bật
      if (!BOT_RESUME_TIME) return true

      // nếu chưa đến giờ -> bot tắt
      if (BOT_RESUME_TIME > Date.now()) return false

      // Đến giờ -> bot bật
      return true
    }

    /** định dạng thời gian dạng mili giây thành dạng thời gian với các đơn vị */
    formatDuration(ms: number): string {
      /** số giây */
      const SENCONDS = Math.floor(ms / 1000)
      /** các đơn vị */
      const UNITS = [
        { label: $t('y'), value: 60 * 60 * 24 * 365 },
        { label: $t('mo'), value: 60 * 60 * 24 * 30 },
        { label: $t('d'), value: 60 * 60 * 24 },
        { label: $t('h'), value: 60 * 60 },
        { label: $t('m'), value: 60 },
        { label: $t('s'), value: 1 },
      ]

      /** số giây còn lại */
      let remaining = SENCONDS

      /** cấu trúc dạng thời gian */
      const PARTS: string[] = []

      // lặp qua các đơn vị
      for (const unit of UNITS) {
        /** số lượng với đơn vị hiện tại */
        const COUNT = Math.floor(remaining / unit.value)
        // nếu lớn hơn 0 mới thêm vào mảng và chia lấy dư số giây
        if (COUNT > 0) {
          PARTS.push(`${COUNT}${unit.label}`)
          remaining %= unit.value
        }
      }

      // nối lại thành chuỗi
      return PARTS.join(' ')
    }

    /** trả về mô tả trạng thái của AI */
    getAiAgentStatus(): string {
      // nếu hội thoại hiện tại không bật AI
      if (!this.calcStatusNew(conversationStore.select_conversation))
        return $t('Không trả lời')

      /** dữ liệu thiết lập ai trả lời */
      const AI_AGENT_WORKING_HOUR_ANSWER = this.getAiAgentWorkingHourAnswer(
        conversationStore.select_conversation
      )

      // nếu thiết lập trả lời ngày
      if (AI_AGENT_WORKING_HOUR_ANSWER?.type === 'SEND_DIRECTLY')
        return $t('Trả lời ngay')

      // nếu thiết lập trả lời sau 1 khoảng thời gian
      if (AI_AGENT_WORKING_HOUR_ANSWER?.type === 'ANSWER_AFTER_AWHILE') {
        /** thời gian khi được định dạng lại */
        const DURATION = this.formatDuration(
          AI_AGENT_WORKING_HOUR_ANSWER?.time || 0
        )
        return $t('Trả lời sau _', { duration: DURATION })
      }

      return ''
    }
  }
  const $main = new Main()

  // nếu không cần lắng nghe thay đổi của khi chuyển hội thoại thì trả về hàm tính toán trạng thái thôi
  if (without_watch) {
    return {
      calcStatus: $main.calcStatusNew.bind($main),
      manageChatbot: $main.manageChatbot.bind($main),
    }
  }

  /** trạng thái hiện tại */
  const is_enable = computed({
    get: () => $main.calcStatusNew(conversationStore.select_conversation),
    set: async val => await $main.manageChatbot(!val),
  })

  /** thiết lập của AI hiện tại */
  const ai_agent_working_hour_answer = computed(() => {
    return $main.getAiAgentWorkingHourAnswer(conversationStore.select_conversation)
  })

  return {
    is_enable,
    ai_agent_working_hour_answer,
    getAiAgentStatus: $main.getAiAgentStatus.bind($main),
  }
}
