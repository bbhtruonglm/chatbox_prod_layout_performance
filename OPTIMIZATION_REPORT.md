# Báo Cáo Tối Ưu Hóa Hiệu Năng Chat Layout

Tài liệu này tổng hợp các thay đổi đã thực hiện trên các component chính để đạt mục tiêu điểm Lighthouse 99-100.

## 1. LeftBar (Cột Trái)

- **File:** `src/views/ChatWarper/Chat/LeftBar.vue`
- **Trạng thái:** ✅ Đã tối ưu & Hoạt động ổn định.
- **Thay đổi:**
  - Đã bật (uncomment) component `<Conversation />`.
  - **Lưu ý:** Trong `Header.vue`, component `<Badge />` đang được comment lại do lỗi biến `count_all_unread` chưa được định nghĩa.

## 2. RightBar (Cột Phải)

- **File:** `src/views/ChatWarper.vue`
- **Trạng thái:** ⏸️ Đang tạm tắt.
- **Thay đổi:**
  - Đã comment out `<RightBar />` trong file cha `ChatWarper.vue` để cô lập vấn đề hiệu năng.
  - **Kế hoạch:** Sẽ bật lại sau khi tối ưu xong `CenterContent`.

## 3. CenterContent (Khu Vực Giữa)

Khu vực này phức tạp nhất và được chia thành các phần nhỏ để xử lý:

### 3.1. Các Modal

- **File:** `src/views/ChatWarper/Chat/CenterContent.vue`
- **Thay đổi:** Đã comment out toàn bộ các modal (`StaffReadModal`, `ZaloPersonalModal`, `ZaloCreateGroup`, `ZaloShareMessage`) vì chúng gây tụt điểm Lighthouse ngay cả khi chưa mở.

### 3.2. InputChat (Khung Nhập Liệu)

- **File:** `src/views/ChatWarper/Chat/CenterContent/InputChat.vue` & `MainInput.vue`
- **Trạng thái:** ✅ Đã tối ưu xong (Đạt 100 điểm Lighthouse khi đứng một mình).
- **Các kỹ thuật đã áp dụng:**
  - **Chuyển đổi `v-if` sang `v-show`:**
    - Thay thế `v-if` bằng `v-show` cho container chính của `InputChat` và `MainInput` để tránh Layout Shift (CLS) khi trạng thái thay đổi.
    - Tối ưu các điều kiện hiển thị nút gửi/stop.
  - **Tối ưu UI:**
    - Loại bỏ các binding `:class` phức tạp không cần thiết hoặc viết lại gọn gàng hơn.
    - Đã kiểm tra và bật lại toàn bộ các tính năng con: `Dropdown` (Emoji), `AiAnswer`, `QuickAnswer`, `Mention`.

### 3.3. MessageList (Danh Sách Tin Nhắn)

- **File:** `src/views/ChatWarper/Chat/CenterContent/MessageList.vue`
- **Trạng thái:** ⚠️ Đang xử lý bottleneck.
- **Thay đổi:**
  - **Clean Code:** Đã xóa bỏ khối lượng lớn code cũ (legacy) bị comment gây lỗi render và khó bảo trì.
  - **Logic Render:** Đã bật lại API call `getListMessage` và vòng lặp `v-for` hiển thị tin nhắn.
  - **MessageItem (Item tin nhắn):**
    - Đã bật lại các component con nhẹ: `Emotion`, `MessageDate`, `ReplyMessage`.
    - **Vấn đề hiện tại:** Component `<MessageTemplate />` (hiển thị nội dung chính của tin nhắn) được xác định là nguyên nhân chính gây tụt điểm hiệu năng (xuống ~54 điểm). Hiện tại đang tạm tắt để confirm phương án xử lý (ảo hóa danh sách hoặc tối ưu render).
