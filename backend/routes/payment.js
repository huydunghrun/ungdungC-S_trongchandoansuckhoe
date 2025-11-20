// routes/payment.js
// Phiên bản HOÀN CHỈNH 2025 – Thanh toán chuyển khoản thủ công (0356484203)
// Hoàn toàn khớp với frontend payment.html + pendingAppointment

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware xác thực JWT (đã đổi tên chuẩn: protect)
const { protect } = require('../middleware/auth');

// Controller
const { createPayment, confirmPayment } = require('../controllers/paymentController');

// ==============================
// POST /api/payment/create
// Tạo yêu cầu thanh toán chuyển khoản thủ công
// ==============================
router.post(
    '/create',
    protect,
    [
        body('appointmentId')
            .isMongoId()
            .withMessage('Mã cuộc hẹn không hợp lệ'),
        body('method')
            .optional()
            .isIn(['chuyenkhoan', 'momo', 'vnpay'])
            .withMessage('Phương thức thanh toán không hỗ trợ')
    ],
    async (req, res) => {
        // Kiểm tra lỗi validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu gửi lên không hợp lệ. Vui lòng thử lại!'
            });
        }

        try {
            await createPayment(req, res);
        } catch (err) {
            console.error('Payment create route error:', err);
            res.status(500).json({
                success: false,
                message: 'MindCare đang xử lý thanh toán... nhưng có chút trục trặc. Bạn thử lại sau vài phút được không?'
            });
        }
    }
);

// ==============================
// POST /api/payment/confirm (dành cho Admin)
// Xác nhận đã nhận tiền chuyển khoản
// ==============================
router.post(
    '/confirm',
    protect,
    [
        body('appointmentId')
            .isMongoId()
            .withMessage('Mã cuộc hẹn không hợp lệ')
    ],
    async (req, res) => {
        // Chỉ admin hoặc doctor mới được xác nhận
        if (!['admin', 'doctor'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xác nhận thanh toán'
            });
        }

        try {
            await confirmPayment(req, res);
        } catch (err) {
            console.error('Payment confirm route error:', err);
            res.status(500).json({
                success: false,
                message: 'Không thể xác nhận thanh toán lúc này'
            });
        }
    }
);

module.exports = router;