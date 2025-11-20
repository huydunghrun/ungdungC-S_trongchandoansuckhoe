// routes/appointment.js
// Phiên bản HOÀN CHỈNH 2025 – CHUẨN 100% cho MindCare Pro

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * 1. LẤY DANH SÁCH BÁC Sĸ (trang đặt lịch)
 */
router.get('/doctors', async (req, res) => {
    try {
        const realDoctors = await User.find({ role: 'doctor' })
            .select('name specialty avatar phone rating')
            .lean();

        // Nếu chưa có bác sĩ thật → trả về danh sách mẫu đẹp (có thể tùy chỉnh)
        const mockDoctors = [
            {
                _id: 'doc1',
                name: 'ThS. Nguyễn Thị Lan Anh',
                specialty: 'Tâm lý lâm sàng & Trầm cảm',
                phone: '0901234567',
                rating: 4.9,
                avatar: '/images/doc1.jpg'
            },
            {
                _id: 'doc2',
                name: 'BS. Trần Minh Tuấn',
                specialty: 'Lo âu, OCD & Rối loạn giấc ngủ',
                phone: '0902345678',
                rating: 5.0,
                avatar: '/images/doc2.jpg'
            },
            {
                _id: 'doc3',
                name: 'ThS. Phạm Hồng Nhung',
                specialty: 'Tâm lý trẻ em & Hôn nhân gia đình',
                phone: '0903456789',
                rating: 4.8,
                avatar: '/images/doc3.jpg'
            }
        ];

        res.json(realDoctors.length > 0 ? realDoctors : mockDoctors);
    } catch (err) {
        console.error('Lỗi tải danh sách bác sĩ:', err);
        res.status(500).json({ message: 'Không thể tải danh sách bác sĩ' });
    }
});

/**
 * 2. ĐẶT LỊCH TƯ VẤN (bệnh nhân) – CHUẨN CHO THANH TOÁN THỦ CÔNG
 */
router.post('/', protect, async (req, res) => {
    try {
        const { doctorId, doctorName, date, time, reason } = req.body;

        // Validate bắt buộc
        if (!doctorName || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn bác sĩ, ngày và giờ tư vấn'
            });
        }

        // Kiểm tra trùng lịch (tránh double booking)
        const conflict = await Appointment.findOne({
            doctorName,
            date,
            time,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: 'Khung giờ này đã được đặt. Vui lòng chọn giờ khác nhé!'
            });
        }

        // Tạo lịch hẹn
        const appointment = new Appointment({
            patientId: req.user.id,
            doctorId: doctorId || null,
            doctorName: doctorName.trim(),
            date,
            time,
            reason: reason?.trim() || 'Tư vấn tâm lý tổng quát',
            status: 'pending',
            paymentStatus: 'unpaid',
            bookedAt: new Date()
        });

        await appointment.save();

        // Trả về dữ liệu đầy đủ để frontend lưu vào localStorage và chuyển sang payment.html
        const responseData = {
            success: true,
            message: 'Đặt lịch thành công! Đang chuyển sang thanh toán...',
            appointment: {
                id: appointment._id,
                doctorName: appointment.doctorName,
                date: appointment.date,
                time: appointment.time,
                reason: appointment.reason,
                amount: 350000,
                content: `MindCare ${appointment._id.toString().slice(-6)} ${date.replace(/-/g, '')}`
            }
        };

        res.json(responseData);

    } catch (err) {
        console.error('Lỗi đặt lịch:', err);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau ít phút'
        });
    }
});

/**
 * 3. LẤY LỊCH HẸN CỦA TÔI
 */
router.get('/my', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.id })
            .sort({ date: -1, time: -1 })
            .select('-__v')
            .lean();

        res.json({
            success: true,
            appointments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi tải lịch hẹn' });
    }
});

/**
 * 4. LẤY TẤT CẢ LỊCH HẸN (bác sĩ & admin)
 */
router.get('/all', protect, async (req, res) => {
    if (!['doctor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email phone')
            .sort({ date: 1, time: 1 })
            .lean();

        res.json({ success: true, appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * 5. HỦY LỊCH HẸN
 */
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch hẹn'
            });
        }

        if (appointment.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Lịch đã thanh toán không thể hủy. Vui lòng liên hệ Zalo: 0356484203 để được hỗ trợ hoàn tiền.'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        await appointment.save();

        res.json({
            success: true,
            message: 'Đã hủy lịch thành công. MindCare luôn chào đón bạn trở lại bất cứ lúc nào'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi hủy lịch' });
    }
});

module.exports = router;