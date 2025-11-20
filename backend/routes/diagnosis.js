// routes/diagnosis.js
// Phiên bản HOÀN CHỈNH 2025 – Chẩn đoán PHQ-9 + GAD-7 + Lịch sử

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware xác thực JWT (đã đổi tên chuẩn: protect)
const { protect } = require('../middleware/auth');

// Controller
const { submitDiagnosis, getHistory } = require('../controllers/diagnosisController');

// ==============================
// POST /api/diagnosis
// Gửi kết quả bài kiểm tra tâm lý
// ==============================
router.post(
    '/',
    protect, // ← Chỉ người đăng nhập mới được làm bài
    [
        body('scoreData')
            .isObject()
            .withMessage('Dữ liệu câu trả lời không hợp lệ'),
        body('totalScore')
            .isInt({ min: 0, max: 48 })
            .withMessage('Tổng điểm phải từ 0 đến 48'),
        body('level')
            .isString()
            .notEmpty()
            .withMessage('Mức độ không được để trống')
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
            await submitDiagnosis(req, res);
        } catch (err) {
            console.error('Diagnosis submit route error:', err);
            res.status(500).json({
                success: false,
                message: 'MindCare đang lưu kết quả... nhưng có chút trục trặc. Bạn thử lại sau vài phút được không?'
            });
        }
    }
);

// ==============================
// GET /api/diagnosis/history
// Lấy lịch sử chẩn đoán của người dùng
// ==============================
router.get('/history', protect, async (req, res) => {
    try {
        await getHistory(req, res);
    } catch (err) {
        console.error('Diagnosis history route error:', err);
        res.status(500).json({
            success: false,
            message: 'Không thể tải lịch sử chẩn đoán lúc này. MindCare đang cố gắng khắc phục...'
        });
    }
});

module.exports = router;