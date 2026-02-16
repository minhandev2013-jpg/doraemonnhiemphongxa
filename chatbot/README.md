# 🤖 ChatBot AI - Python

Chatbot AI đơn giản bằng Python, có thể nhúng bong bóng chat vào bất kỳ trang web nào.

## 📁 Cấu trúc thư mục

```
chatbot/
├── app.py              # Server Flask chính
├── requirements.txt    # Dependencies
├── README.md           # Hướng dẫn
└── static/
    ├── demo.html       # Trang demo
    ├── widget.css      # CSS cho widget
    └── widget.js       # JavaScript widget nhúng
```

## 🚀 Cách chạy

### 1. Cài đặt dependencies

```bash
cd chatbot
pip install -r requirements.txt
```

### 2. Chạy server

```bash
python app.py
```

Server sẽ chạy tại: **http://localhost:5000**

### 3. Xem demo

Mở trình duyệt và truy cập: **http://localhost:5000**

## 📦 Cách nhúng vào trang web

Thêm dòng sau vào trước `</body>` của trang web bất kỳ:

```html
<script src="http://localhost:5000/widget.js"></script>
```

### Tùy chỉnh (tùy chọn):

```html
<script
  src="http://localhost:5000/widget.js"
  data-server="http://localhost:5000"
  data-title="Tên Bot của bạn"
  data-welcome="Lời chào tùy chỉnh"
  data-color="#FF6B6B"
></script>
```

| Thuộc tính | Mô tả | Mặc định |
|---|---|---|
| `data-server` | URL server chatbot | `http://localhost:5000` |
| `data-title` | Tên hiển thị trên header | `Trợ lý AI 🤖` |
| `data-welcome` | Tin nhắn chào mừng | `Xin chào! 👋...` |
| `data-color` | Màu chủ đạo (hex) | `#6C63FF` |

## 🧠 Thêm câu trả lời cho Bot

Mở file `app.py`, tìm `KNOWLEDGE_BASE` và thêm category mới:

```python
"ten_category": {
    "patterns": ["từ khóa 1", "từ khóa 2"],
    "responses": [
        "Câu trả lời 1",
        "Câu trả lời 2",
    ]
},
```

## ✨ Tính năng

- 💬 Chat real-time với AI
- 🎨 Giao diện đẹp, hiện đại  
- 📱 Responsive trên mobile
- ⚡ Nhúng dễ dàng chỉ 1 dòng code
- 🔧 Dễ tùy chỉnh màu sắc, tên, lời chào
- 🇻🇳 Hỗ trợ tiếng Việt
