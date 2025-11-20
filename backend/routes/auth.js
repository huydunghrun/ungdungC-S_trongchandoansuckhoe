// routes/auth.js
// Phiên bản HOÀN CHỈNH 2025 – Đăng nhập / Đăng ký MindCare Pro
// Đã fix lỗi dòng 317, thêm comment rõ ràng, chuẩn REST API

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ==============================
// 1. Rate limit chống brute-force đăng nhập
// ==============================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 phút
    max: 10,                    // tối đa 10 lần thử
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại nhé!'
    }
});

// ==============================
// 2. ĐĂNG KÝ TÀI KHOẢN
// ==============================
router.post(
    '/register',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Họ tên phải từ 2 đến 50 ký tự'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email không hợp lệ'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        try {
            await register(req, res);
        } catch (err) {
            console.error('Register route error:', err);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau ít phút'
            });
        }
    }
);

// ==============================
// 3. ĐĂNG NHẬP (có chống spam)
// ==============================
router.post(
    '/login',
    loginLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email không hợp lệ'),
        body('password')
            .notEmpty()
            .withMessage('Vui lòng nhập mật khẩu')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        try {
            await login(req, res);
        } catch (err) {
            console.error('Login route error:', err);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau'
            });
        }
    }
);

// ==============================
// 4. ĐĂNG XUẤT (frontend chỉ cần xóa token)
// ==============================
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công. MindCare luôn chờ bạn quay lại!'
    });
});

// ==============================
// 5. LẤY THÔNG TIN USER HIỆN TẠI (kiểm tra token còn hạn)
// ==============================
router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            name: req.user.name || 'Người dùng MindCare',
            email: req.user.email,
            role: req.user.role || 'patient'
        }
    });
});

module.exports = router;