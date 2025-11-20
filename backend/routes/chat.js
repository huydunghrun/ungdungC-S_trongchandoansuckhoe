// routes/chat.js
// Phiên bản HOÀN CHỈNH 2025 – Chat với MindCare AI (Gemini)

// Import cần thiết
const express = require('express');
const router = express.Router();

// Middleware xác thực JWT
const { protect } = require('../middleware/auth');

// Controller xử lý chat với Gemini AI
const { chat } = require('../controllers/chatController');

// ==============================
// POST /api/chat
// Gửi tin nhắn → nhận phản hồi từ MindCare AI
// ==============================
router.post(
    '/',
    protect, // ← Bảo vệ route: chỉ user đã đăng nhập mới được chat
    [
        // Optional: validate đầu vào (nếu muốn chặt chẽ hơn)
        // body('message')
        //     .trim()
        //     .isLength({ min: 1, max: 1000 })
        //     .withMessage('Tin nhắn không được để trống và tối đa 1000 ký tự'),
    ],
    async (req, res) => {
        try {
            // Gọi controller xử lý
            await chat(req, res);
        } catch (err) {
            console.error('Chat route error:', err);
            // Đảm bảo luôn trả về response ấm áp, không để lỗi trắng
            res.status(500).json({
                success: false,
                reply: 'MindCare AI đang nghỉ ngơi một chút để nạp lại năng lượng yêu thương. Bạn thử lại sau vài phút nhé!'
            });
        }
    }
);

module.exports = router;