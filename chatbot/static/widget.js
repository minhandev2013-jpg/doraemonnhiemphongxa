/**
 * ============================================================
 * CHATBOT WIDGET - Embeddable Chat Bubble
 * Nhúng vào bất kỳ trang web nào bằng 1 dòng script
 * ============================================================
 *
 * CÁCH SỬ DỤNG:
 * Thêm dòng sau vào trước </body> của trang web:
 * <script src="http://localhost:5000/widget.js"></script>
 *
 * TÙY CHỈNH (tùy chọn):
 * <script
 *   src="http://localhost:5000/widget.js"
 *   data-server="http://localhost:5000"
 *   data-title="Tên Bot"
 *   data-welcome="Lời chào"
 *   data-color="#6C63FF"
 * ></script>
 */

(function () {
    'use strict';

    // Lấy cấu hình từ script tag
    const scriptTag = document.currentScript;
    const CONFIG = {
        serverUrl: (scriptTag && scriptTag.getAttribute('data-server')) || 'http://localhost:5000',
        title: (scriptTag && scriptTag.getAttribute('data-title')) || 'Trợ lý AI 🤖',
        welcome: (scriptTag && scriptTag.getAttribute('data-welcome')) || 'Xin chào! 👋 Mình là trợ lý AI. Mình có thể giúp gì cho bạn hôm nay?',
        primaryColor: (scriptTag && scriptTag.getAttribute('data-color')) || '#6C63FF',
    };

    // Tải CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = CONFIG.serverUrl + '/widget.css';
    document.head.appendChild(cssLink);

    // Inject custom color nếu có
    if (CONFIG.primaryColor !== '#6C63FF') {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --chat-primary: ${CONFIG.primaryColor};
                --chat-user-msg: ${CONFIG.primaryColor};
                --chat-gradient: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.primaryColor}99 100%);
            }
        `;
        document.head.appendChild(style);
    }

    // Tạo HTML widget
    const widgetHTML = `
        <!-- Nút bong bóng chat -->
        <button id="chatbot-bubble" aria-label="Mở chatbot">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"/>
                <path d="M7 9H17V11H7V9ZM7 5H17V7H7V5ZM7 13H14V15H7V13Z"/>
            </svg>
            <div id="chatbot-badge" style="display:none;">1</div>
        </button>

        <!-- Cửa sổ chat -->
        <div id="chatbot-window">
            <!-- Header -->
            <div id="chatbot-header">
                <div id="chatbot-header-avatar">🤖</div>
                <div id="chatbot-header-info">
                    <div id="chatbot-header-name">${CONFIG.title}</div>
                    <div id="chatbot-header-status">Đang hoạt động</div>
                </div>
                <button id="chatbot-close-btn" aria-label="Đóng">✕</button>
            </div>

            <!-- Tin nhắn -->
            <div id="chatbot-messages"></div>

            <!-- Nhập tin nhắn -->
            <div id="chatbot-input-area">
                <input
                    type="text"
                    id="chatbot-input"
                    placeholder="Nhập tin nhắn..."
                    autocomplete="off"
                />
                <button id="chatbot-send-btn" aria-label="Gửi">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>

            <!-- Footer -->
            <div id="chatbot-footer">Powered by ChatBot AI ✨</div>
        </div>
    `;

    // Thêm widget vào trang
    const container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // DOM Elements
    const bubble = document.getElementById('chatbot-bubble');
    const chatWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const messagesDiv = document.getElementById('chatbot-messages');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const badge = document.getElementById('chatbot-badge');

    let isOpen = false;
    let isFirstOpen = true;

    // Hiển thị / Ẩn cửa sổ chat
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        bubble.classList.toggle('active', isOpen);

        if (isOpen) {
            badge.style.display = 'none';
            input.focus();

            if (isFirstOpen) {
                isFirstOpen = false;
                // Thêm tin nhắn chào mừng
                addMessage(CONFIG.welcome, 'bot');

                // Thêm quick replies
                addQuickReplies(['Xin chào 👋', 'Bạn làm được gì?', 'Trợ giúp']);
            }
        }
    }

    // Thêm tin nhắn
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chatbot-msg ${sender}`;

        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');

        // Xử lý xuống dòng
        const formattedText = text.replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            ${formattedText}
            <span class="chatbot-msg-time">${timeStr}</span>
        `;

        messagesDiv.appendChild(msgDiv);
        scrollToBottom();
    }

    // Thêm Quick Reply buttons
    function addQuickReplies(replies) {
        const container = document.createElement('div');
        container.className = 'chatbot-quick-replies';

        replies.forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-quick-reply';
            btn.textContent = text;
            btn.onclick = () => {
                container.remove();
                sendMessage(text);
            };
            container.appendChild(btn);
        });

        messagesDiv.appendChild(container);
        scrollToBottom();
    }

    // Hiện typing indicator
    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'chatbot-typing';
        typing.id = 'chatbot-typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesDiv.appendChild(typing);
        scrollToBottom();
    }

    // Ẩn typing indicator
    function hideTyping() {
        const typing = document.getElementById('chatbot-typing-indicator');
        if (typing) typing.remove();
    }

    // Cuộn xuống cuối
    function scrollToBottom() {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Gửi tin nhắn
    async function sendMessage(text) {
        if (!text || !text.trim()) return;

        const message = text.trim();
        addMessage(message, 'user');
        input.value = '';

        showTyping();

        try {
            const response = await fetch(CONFIG.serverUrl + '/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) throw new Error('Server error');

            const data = await response.json();

            // Delay nhỏ để giống người thật
            setTimeout(() => {
                hideTyping();
                addMessage(data.response, 'bot');
            }, 600 + Math.random() * 800);

        } catch (error) {
            setTimeout(() => {
                hideTyping();
                addMessage('Xin lỗi, có lỗi kết nối. Vui lòng thử lại! 😥', 'bot');
            }, 500);
        }
    }

    // Event Listeners
    bubble.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    sendBtn.addEventListener('click', () => {
        sendMessage(input.value);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(input.value);
        }
    });

    // Hiện badge sau 3 giây nếu chưa mở
    setTimeout(() => {
        if (!isOpen) {
            badge.style.display = 'flex';
        }
    }, 3000);

    console.log('🤖 ChatBot Widget loaded successfully!');
})();
