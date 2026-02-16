"""
Chatbot AI đơn giản - Flask Backend
Hỗ trợ nhúng bong bóng chat vào bất kỳ trang web nào.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import re
import random
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app)  # Cho phép cross-origin requests

# ============================================================
# CƠ SỞ TRI THỨC CỦA CHATBOT (Knowledge Base)
# Bạn có thể thêm/sửa các câu trả lời tại đây
# ============================================================

KNOWLEDGE_BASE = {
    # Chào hỏi
    "greetings": {
        "patterns": ["xin chào", "hello", "hi", "chào bạn", "hey", "chào", "alo", "helu"],
        "responses": [
            "Xin chào! 👋 Mình là trợ lý AI. Mình có thể giúp gì cho bạn?",
            "Chào bạn! 😊 Rất vui được gặp bạn! Bạn cần hỗ trợ gì?",
            "Hello! 🌟 Mình sẵn sàng giúp đỡ bạn. Hãy hỏi mình bất cứ điều gì!",
        ]
    },

    # Hỏi tên
    "name": {
        "patterns": ["tên gì", "bạn là ai", "bạn tên gì", "tên bạn", "who are you", "your name"],
        "responses": [
            "Mình là ChatBot AI 🤖, được tạo ra để hỗ trợ bạn!",
            "Mình là trợ lý ảo AI! Bạn có thể gọi mình là Bot nhé 😄",
        ]
    },

    # Hỏi thời gian
    "time": {
        "patterns": ["mấy giờ", "bây giờ là", "thời gian", "what time", "giờ bao nhiêu"],
        "responses": ["_TIME_"]  # Sẽ được xử lý đặc biệt
    },

    # Hỏi về khả năng
    "capabilities": {
        "patterns": ["làm được gì", "giúp gì", "biết gì", "what can you do", "khả năng"],
        "responses": [
            "Mình có thể:\n• 💬 Trò chuyện với bạn\n• ❓ Trả lời các câu hỏi\n• 📝 Cung cấp thông tin\n• 🎯 Hỗ trợ và gợi ý\nHãy hỏi mình bất cứ điều gì nhé!",
        ]
    },

    # Cảm ơn
    "thanks": {
        "patterns": ["cảm ơn", "thank", "thanks", "tks", "cám ơn", "thank you"],
        "responses": [
            "Không có gì! 😊 Mình luôn sẵn lòng giúp đỡ!",
            "Rất vui vì đã giúp được bạn! 🌈",
            "Bạn quá tử tế! Hãy hỏi thêm nếu cần nhé! ❤️",
        ]
    },

    # Tạm biệt
    "goodbye": {
        "patterns": ["tạm biệt", "bye", "goodbye", "bái bai", "see you", "gặp lại"],
        "responses": [
            "Tạm biệt bạn! 👋 Hẹn gặp lại nhé!",
            "Bye bye! 🌸 Chúc bạn một ngày tốt lành!",
            "Hẹn gặp lại! 😊 Bạn luôn được chào đón quay lại!",
        ]
    },

    # Hỏi về sức khỏe
    "health": {
        "patterns": ["khỏe không", "thế nào", "how are you", "ổn không", "dạo này sao"],
        "responses": [
            "Mình khỏe lắm! 💪 Cảm ơn bạn đã hỏi. Bạn thì sao?",
            "Mình luôn tràn đầy năng lượng! ⚡ Bạn có khỏe không?",
        ]
    },

    # Trợ giúp
    "help": {
        "patterns": ["giúp tôi", "help", "hỗ trợ", "trợ giúp", "cần giúp"],
        "responses": [
            "Mình ở đây để giúp bạn! 🤝 Hãy cho mình biết bạn cần gì nhé:\n• Hỏi đáp thông tin\n• Trò chuyện\n• Tư vấn & gợi ý",
        ]
    },

    # Đùa / Vui
    "joke": {
        "patterns": ["kể chuyện cười", "joke", "vui", "hài", "đùa", "funny"],
        "responses": [
            "😂 Tại sao lập trình viên thích uống trà?\nVì họ không thích bugs trong coffee!",
            "😄 Con gì đi mà không có chân?\nĐáp: Con mắt! 👀",
            "🤣 Hai con cá gặp nhau, một con hỏi: 'Hôm nay bạn thế nào?'\nCon kia trả lời: 'Ướt! 🐟'",
        ]
    },

    # Website / Trang web
    "website": {
        "patterns": ["website", "trang web", "web này", "trang này"],
        "responses": [
            "Đây là trang web tuyệt vời! 🌐 Bạn có câu hỏi gì về trang web không?",
            "Mình là chatbot hỗ trợ cho trang web này! Bạn cần tìm hiểu điều gì? 🔍",
        ]
    },
}

# Câu trả lời mặc định khi không hiểu
DEFAULT_RESPONSES = [
    "Hmm, mình chưa hiểu lắm 🤔 Bạn có thể nói rõ hơn được không?",
    "Xin lỗi, mình chưa được huấn luyện để trả lời câu hỏi này 😅 Bạn thử hỏi cách khác nhé!",
    "Mình cần học thêm để trả lời câu hỏi này! 📚 Bạn có thể hỏi mình về:\n• Thông tin chung\n• Trò chuyện\n• Trợ giúp",
    "Câu hỏi thú vị! 🧐 Nhưng mình chưa có câu trả lời. Hãy thử hỏi câu khác nhé!",
]


def get_response(user_message: str) -> str:
    """Xử lý tin nhắn và trả về câu trả lời phù hợp."""
    message = user_message.lower().strip()

    # Kiểm tra từng pattern trong knowledge base
    for category, data in KNOWLEDGE_BASE.items():
        for pattern in data["patterns"]:
            if pattern in message:
                response = random.choice(data["responses"])

                # Xử lý đặc biệt cho thời gian
                if response == "_TIME_":
                    now = datetime.now()
                    return f"Bây giờ là {now.strftime('%H:%M')} ngày {now.strftime('%d/%m/%Y')} ⏰"

                return response

    # Nếu không tìm thấy pattern phù hợp
    return random.choice(DEFAULT_RESPONSES)


# ============================================================
# API ENDPOINTS
# ============================================================

@app.route('/')
def index():
    """Trang chủ - hiển thị demo chatbot."""
    return send_from_directory('static', 'demo.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """API endpoint cho chatbot."""
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({'error': 'Thiếu tin nhắn'}), 400

    user_message = data['message']
    bot_response = get_response(user_message)

    return jsonify({
        'response': bot_response,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/widget.js')
def widget():
    """Trả về file JavaScript widget để nhúng vào web."""
    return send_from_directory('static', 'widget.js', mimetype='application/javascript')


@app.route('/widget.css')
def widget_css():
    """Trả về file CSS widget."""
    return send_from_directory('static', 'widget.css', mimetype='text/css')


if __name__ == '__main__':
    print("Chatbot AI dang chay tai http://localhost:5000")
    print("Widget URL: http://localhost:5000/widget.js")
    print("Demo: http://localhost:5000")
    app.run(debug=True, port=5000)
