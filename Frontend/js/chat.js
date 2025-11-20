// js/chat.js – Phiên bản hoàn chỉnh, mượt mà & ấm áp
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const chatForm = document.getElementById('chatForm');

// Hiển thị tên người dùng trong lời chào
document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || 'bạn';
    const welcomeEl = document.querySelector('#user-name');
    if (welcomeEl) welcomeEl.textContent = userName;
});

// Hàm thêm tin nhắn (có hiệu ứng mượt)
function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in-up`;
    
    // Thêm avatar nhỏ cho AI
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="me-3">
                    <img src="/images/ai-avatar.png" alt="AI" class="rounded-circle" width="36" height="36">
                </div>
                <div class="flex-grow-1">
                    <small class="text-purple fw-bold">MindCare AI</small>
                    <div class="mt-1">${text.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `<div class="text-end">${text.replace(/\n/g, '<br>')}</div>`;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

// Hiệu ứng "đang gõ..."
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message fade-in-up';
    typingDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="/images/ai-avatar.png" alt="AI" class="rounded-circle me-3" width="36" height="36">
            <div class="typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    typingDiv.id = 'typing-indicator';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

// Xử lý gửi tin nhắn
chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Hiển thị tin nhắn người dùng
    appendMessage('user', message);
    chatInput.value = '';

    // Hiển thị hiệu ứng đang gõ
    const typingIndicator = showTyping();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        // Xóa hiệu ứng gõ
        removeTyping();

        if (res.ok && data.reply) {
            appendMessage('ai', data.reply);
        } else {
            appendMessage('ai', 'Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau vài phút nhé');
        }
    } catch (err) {
        console.error('Chat error:', err);
        removeTyping();
        appendMessage('ai', 'Không kết nối được với MindCare AI lúc này. Bạn thử lại sau nhé');
    }
});

// Cho phép gửi bằng phím Enter (không Shift + Enter)
chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});