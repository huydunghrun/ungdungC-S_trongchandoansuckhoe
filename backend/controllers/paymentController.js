// controllers/paymentController.js
// Phiên bản 2025 – Thanh toán thủ công + sẵn sàng mở rộng Momo/VNPay

const Appointment = require('../models/Appointment');

/**
 * Tạo yêu cầu thanh toán (hiện tại: chuyển khoản thủ công)
 * Frontend sẽ lưu appointment vào localStorage → gọi API này để đánh dấu "đã yêu cầu thanh toán"
 */
const createPayment = async (req, res) => {
    try {
        const { appointmentId, method = 'chuyenkhoan' } = req.body;
        const userId = req.user.id;

        if (!appointmentId) {
            return res.status(400).json({ message: 'Thiếu mã cuộc hẹn' });
        }

        // Tìm và cập nhật trạng thái cuộc hẹn
        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, patientId: userId },
            { 
                paymentMethod: method,
                paymentStatus: 'pending', // chờ xác nhận thủ công
                paymentRequestedAt: new Date()
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
        }

        // Thông tin ngân hàng cố định (bạn đang dùng)
        const bankInfo = {
            bankName: 'MB Bank',
            accountNumber: '0356484203',
            accountName: 'NGUYEN THI THUY LINH',
            amount: 350000,
            content: `MindCare ${appointmentId.slice(-6)} ${appointment.date.replace(/-/g, '')}`
        };

        // Nếu muốn sau này tích hợp Momo/VNPay → chỉ cần thêm điều kiện
        if (method === 'momo' || method === 'vnpay') {
            const mockUrl = method === 'momo' 
                ? `https://momo.vn/pay?ref=${appointmentId}`
                : `https://vnpay.vn/pay?ref=${appointmentId}`;

            return res.json({
                success: true,
                paymentUrl: mockUrl,
                message: 'Đang chuyển hướng đến cổng thanh toán...'
            });
        }

        // Trường hợp chuyển khoản thủ công (hiện tại bạn dùng)
        res.json({
            success: true,
            method: 'chuyenkhoan',
            paymentInfo: {
                ...bankInfo,
                qrCode: '/images/qr-mbbank.jpg', // bạn để file QR trong frontend
                message: 'Vui lòng chuyển khoản đúng nội dung để được duyệt nhanh nhất'
            },
            appointment: {
                id: appointment._id,
                doctorName: appointment.doctorName,
                date: appointment.date,
                time: appointment.time
            },
            message: 'Thông tin thanh toán đã được gửi. Vui lòng chuyển khoản và gửi biên lai về Zalo 0356484203'
        });

    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ message: 'Lỗi hệ thống thanh toán' });
    }
};

/**
 * Admin xác nhận thanh toán thủ công (gọi từ admin panel)
 */
const confirmPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { 
                paymentStatus: 'paid',
                status: 'confirmed',
                paymentConfirmedAt: new Date(),
                paymentConfirmedBy: req.user.id
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
        }

        res.json({
            success: true,
            message: 'Thanh toán đã được xác nhận. Phòng tư vấn đã mở!',
            appointment
        });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi xác nhận thanh toán' });
    }
};

module.exports = { createPayment, confirmPayment };