# LinguaFlash Pro — Import Lessons v1

## Mục đích
Biên soạn PDF bằng ChatGPT (kể cả ChatGPT Go), xuất JSON hoặc Excel, sau đó tải lên mục **Quản lý → Import Lessons**. Người học dùng nội dung mới mà không cần cho ChatGPT điều khiển trình duyệt, Supabase hay website. File gốc và trạng thái SRS không bị sửa.

## Quy trình
1. Gửi PDF vào ChatGPT và yêu cầu tạo **đúng một JSON object cho một bài học** theo cấu trúc bên dưới.
2. Mở LinguaFlash, đăng nhập tài khoản quản trị, đến **Quản lý → Import Lessons**.
3. Chọn file .json/.xlsx/.xls/.csv hoặc dán JSON, bấm **1. Xem trước**.
4. Kiểm tra mã bài, số thẻ, dòng thiếu dữ liệu, thẻ trùng và trạng thái trùng mã bài.
5. Chỉ sau khi đồng ý, bấm **2. Xuất bản**. Bài xuất hiện ở Học/Flashcard, các bộ lọc/chế độ ôn luyện, và Hội thoại nếu có dòng hội thoại cùng người nói (speaker).

## JSON mẫu
~~~json
{
  "lesson_id": "business-en-unit-1-lesson-7",
  "title": "Unit 1 Lesson 7 - My Work",
  "language": "en",
  "category": "51Talk English",
  "cards": [
    {
      "type": "vocab",
      "word": "designer",
      "meaning": "nhà thiết kế",
      "chinese": "设计师",
      "phonetic": "/dɪˈzaɪnər/",
      "example": "I am a designer.",
      "exampleTrans": "Tôi là nhà thiết kế.",
      "topic": "Vocabulary"
    },
    {
      "type": "dialogue",
      "speaker": "A",
      "en": "What do you do?",
      "vi": "Bạn làm nghề gì?",
      "zh": "你做什么工作？"
    },
    {
      "type": "dialogue",
      "speaker": "B",
      "en": "I am a designer.",
      "vi": "Tôi là nhà thiết kế.",
      "zh": "我是一名设计师。"
    }
  ]
}
~~~

- language: **en** hoặc **zh**; category là nhóm bài (ví dụ: 51Talk English, Gia Hân).
- type: **vocab**, **sentence**, **dialogue**. Các thẻ ngữ pháp/cấu trúc có thể dùng sentence.
- Với từ vựng tiếng Trung, dùng word=Hán tự, phonetic=Pinyin, meaning=nghĩa Việt, chinese=bản tiếng Anh (giữ tên trường theo schema hiện có).
- Với hội thoại, khai báo speaker, en, vi, zh. Trường phonetic tùy chọn để thêm IPA/Pinyin theo ngôn ngữ chính.
- Mỗi bài 1–500 thẻ. Thiếu nội dung hoặc nghĩa Việt sẽ bị loại. Trùng nội dung cùng bài hoặc trùng thẻ hiện có được kiểm tra trước khi nhập.
- ID mỗi thẻ được sinh ổn định từ nội dung để tránh trùng trong quá trình nhập lại. Đổi nội dung gốc có thể tạo ID mới; cần xem trước khi ghi đè bài cũ.
- Nội dung mới chưa có MP3 từ người thật; tính năng nhập không tự tạo âm thanh hay xóa file âm thanh nào.

## Excel/CSV — hàng đầu tiên chứa thông tin bài
Cột: Lesson ID | Lesson | Language | Category | Card Type | Word | Meaning | IPA/Pinyin | Chinese/English | Example | Example Translation | Topic | Speaker | English | Chinese | Vietnamese

Một file Excel chỉ chứa **một bài học** (các dòng dùng cùng Lesson ID). Bỏ trống giá trị Lesson ID/Title/Language/Category ở những dòng sau được.

## Mẫu câu lệnh cho ChatGPT Go

"Đọc toàn bộ PDF đính kèm và biên soạn thành 1 file JSON UTF-8 theo định dạng LinguaFlash Import Lessons đã cho. Không bỏ sót từ vựng, hội thoại, câu mẫu và cấu trúc quan trọng. Giữ thứ tự các mục trong tài liệu. Mỗi từ/câu có nghĩa tiếng Việt. Từ/câu tiếng Anh thêm IPA khi xác định được chính xác; từ/câu tiếng Trung thêm Pinyin. Bổ sung bản tương ứng tiếng Anh và tiếng Trung khi có thể xác minh, không tự bịa lời hội thoại nguồn. Chia rõ topic: Vocabulary, Dialogue, Grammar, Practice. Tránh trùng nội dung. Trả về JSON hợp lệ, không kèm nhận xét ngoài JSON."

## Quyền và an toàn
- Supabase lưu bài học đã xuất bản trong public.linguaflash_import_lessons. Tất cả tài khoản được đọc bài published.
- Chỉ người có trong public.linguaflash_admins được thêm/cập nhật (kiểm tra bằng RLS, không tin vào nút hiển thị).
- Không cấp quyền xóa bài trong trình duyệt; không đụng đến bảng lịch ôn hay thư viện audio.
- Nếu mở web mà không có internet, bài tích hợp trong bộ nhớ trình duyệt vẫn có thể học; bài mới từ Supabase cần được tải ít nhất một lần qua mạng.
