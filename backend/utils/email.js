// backend/utils/email.js
// Phiên bản HOÀN CHỈNH 2025 – Gửi email xác nhận đặt lịch, thanh toán, tư vấn...
// Dùng Gmail App Password hoặc SMTP bất kỳ – cực kỳ ổn định & đẹp

const nodemailer = require('nodemailer');

// Tạo transporter một lần duy nhất → tái sử dụng (tối ưu hiệu suất)
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    // Kiểm tra biến môi trường bắt buộc
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Cảnh báo: Thiếu EMAIL_USER hoặc EMAIL_PASS trong .env');
        return null;
    }

    transporter = nodemailer.createTransporter({
        service: 'gmail', // có thể đổi thành 'hotmail', 'yahoo',...
        auth: {
            user: process.env.EMAIL_USER,     // ví dụ: mindcare.official@gmail.com
            pass: process.env.EMAIL_PASS      // App Password (không phải mật khẩu Gmail thường)
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Xác thực kết nối (chỉ chạy 1 lần)
    transporter.verify((error, success) => {
        if (error) {
            console.error('Lỗi kết nối email SMTP:', error.message);
            transporter = null; // reset để thử lại lần sau
        } else {
            console.log('SMTP email đã sẵn sàng – MindCare có thể gửi thư');
        }
    });

    return transporter;
};

/**
 * Gửi email với template đẹp & ấm áp
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề
 * @param {string} html - Nội dung HTML (có thể dùng template)
 * @param {string} text - Nội dung text thuần (fallback)
 */
const sendEmail = async (to, subject, html, text = 'MindCare - Luôn ở đây vì bạn') => {
    const mailTransporter = getTransporter();
    if (!mailTransporter) {
        console.error('Không thể gửi email: Transporter không khả dụng');
        return false;
    }

    const mailOptions = {
        from: `"MindCare" <${process.env.EMAIL_USER}>`,
        to,
        subject: `${subject}`,
        text,
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: linear-gradient(to bottom, #f0f9ff, #ffffff); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #22c55e; font-size: 28px;">MindCare</h1>
                <p style="color: #666; font-size: 16px;">Luôn ở đây vì bạn</p>
            </div>
            <div style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                ${html}
            </div>
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
                <p>© 2025 MindCare – Chữa lành từ tâm</p>
                <p>Zalo hỗ trợ: <strong>0356484203</strong></p>
            </div>
        </div>
        `.trim()
    };

    try {
        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`Email đã gửi thành công tới ${to} | MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Lỗi gửi email:', error.message);
        return false;
    }
};

/**
 * Template email ĐẶT LỊCH THÀNH CÔNG
 */
const sendAppointmentConfirmedEmail = async (to, appointment) => {
    const html = `
        <h2 style="color: #22c55e;">Chúc mừng bạn đã đặt lịch tư vấn thành công!</h2>
        <p>Cảm ơn bạn đã tin tưởng <strong>MindCare</strong>. Chúng tôi rất trân trọng điều đó</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #22c55e;">
            <p><strong>Bác sĩ:</strong> ${appointment.doctorName}</p>
            <p><strong>Ngày tư vấn:</strong> ${new Date(appointment.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Thời gian:</strong> ${appointment.time.replace(':00', '')} - ${(parseInt(appointment.time.split(':')[0]) + 1)}:00</p>
            <p><strong>Mã cuộc hẹn:</strong> <code style="background:#e5e7eb; padding:4px 8px; border-radius:6px;">${appointment._id}</code></p>
        </div>
        <p>Phòng tư vấn sẽ được mở <strong>5 phút trước giờ hẹn</strong>. Bạn vui lòng chuẩn bị tai nghe và không gian yên tĩnh nhé</p>
        <p>Chúng tôi đang rất mong được đồng hành cùng bạn trên hành trình chữa lành</p>
        <p style="margin-top: 30px; color: #22c55e; font-weight: bold;">MindCare – Luôn ở đây vì bạn</p>
    `;

    return await sendEmail(to, 'Đặt lịch tư vấn thành công – MindCare', html);
};

/**
 * Template email THANH TOÁN THÀNH CÔNG
 */
const sendPaymentSuccessEmail = async (to, appointment) => {
    const html = `
        <h2 style="color: #22c55e;">Thanh toán thành công!</h2>
        <p>Chúng tôi đã nhận được thanh toán của bạn. Cảm ơn bạn rất nhiều</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #22c55e;">
            <p><strong>Mã cuộc hẹn:</strong> <code>${appointment._id}</code></p>
            <p><strong>Số tiền:</strong> 350.000 VNĐ</p>
            <p><strong>Trạng thái:</strong> <span style="color:#22c55e; font-weight:bold;">ĐÃ XÁC NHẬN</span></p>
        </div>
        <p>Phòng tư vấn đã được mở. Bạn có thể vào bất cứ lúc nào trước giờ hẹn</p>
        <p>Chúc bạn có một buổi tư vấn thật ý nghĩa và chữa lành</p>
    `;

    return await sendEmail(to, 'Thanh toán thành công – MindCare', html);
};

module.exports = {
    sendEmail,
    sendAppointmentConfirmedEmail,
    sendPaymentSuccessEmail
};