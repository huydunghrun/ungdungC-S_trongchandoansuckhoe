// /js/payment.js – Phiên bản 2025 hoàn chỉnh cho thanh toán chuyển khoản thủ công
// Hoàn toàn phù hợp với payment.html rộng rãi + STK 0356484203

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPage === 'function') initPage();

    // Lấy thông tin cuộc hẹn từ localStorage (sau khi đặt lịch thành công)
    const pendingAppointment = JSON.parse(localStorage.getItem('pendingAppointment') || '{}');

    if (pendingAppointment && pendingAppointment.id) {
        displayAppointmentInfo(pendingAppointment);
    } else {
        // Nếu không có → hiển thị mặc định
        displayDefaultInfo();
    }

    // Sự kiện chọn phương thức thanh toán
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', function () {
            document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});

/**
 * Hiển thị thông tin cuộc hẹn lên trang thanh toán
 */
function displayAppointmentInfo(appointment) {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        return time.replace(':00', '') + ' - ' + (parseInt(time.split(':')[0]) + 1) + ':00';
    };

    // Cập nhật các phần tử trên giao diện
    document.getElementById('doctorName') && 
        (document.getElementById('doctorName').textContent = appointment.doctorName || 'Chuyên gia tâm lý');

    document.getElementById('appointmentDate') && 
        (document.getElementById('appointmentDate').textContent = formatDate(appointment.date));

    document.getElementById('appointmentTime') && 
        (document.getElementById('appointmentTime').textContent = formatTime(appointment.time));

    document.getElementById('appointmentId') && 
        (document.getElementById('appointmentId').textContent = appointment.id);

    document.getElementById('patientName') && 
        (document.getElementById('patientName').textContent = localStorage.getItem('userName') || 'Bạn');
}

/**
 * Nếu không có dữ liệu cuộc hẹn → hiển thị mặc định đẹp
 */
function displayDefaultInfo() {
    document.getElementById('doctorName') && 
        (document.getElementById('doctorName').textContent = 'Chuyên gia tâm lý MindCare');

    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('appointmentDate') && 
        (document.getElementById('appointmentDate').textContent = today);

    document.getElementById('appointmentTime') && 
        (document.getElementById('appointmentTime').textContent = 'Theo lịch đã chọn');

    document.getElementById('patientName') && 
        (document.getElementById('patientName').textContent = localStorage.getItem('userName') || 'Bạn');
}

/**
 * Gọi khi người dùng nhấn nút "Tôi đã chuyển khoản xong"
 */
function completePayment() {
    const selectedMethod = document.querySelector('.method-card.selected');
    if (!selectedMethod) {
        alert('Vui lòng chọn phương thức thanh toán');
        return;
    }

    const methodName = selectedMethod.querySelector('h4').textContent.trim();
    const accountNumber = '0356484203';

    // Hiển thị thông báo cảm ơn cực kỳ ấm áp
    const userName = localStorage.getItem('userName') || 'bạn';

    alert(`
Cảm ơn ${userName} rất nhiều!

MindCare đã nhận được thông báo thanh toán qua ${methodName}

Số tài khoản: ${accountNumber}

Vui lòng gửi ảnh biên lai (chụp màn hình chuyển khoản) về:
Zalo / Fanpage: 0356484203

Phòng tư vấn sẽ được mở ngay lập tức sau khi admin xác nhận (thường trong 5-10 phút)

Chúng tôi đang chờ bạn với tất cả sự trân trọng và yêu thương

MindCare - Luôn ở đây vì bạn
    `.trim());

    // Xóa dữ liệu tạm để tránh đặt lại
    localStorage.removeItem('pendingAppointment');

    // Chuyển về dashboard sau 2 giây
    setTimeout(() => {
        window.location.href = '/dashboard-patient.html';
    }, 2000);
}

/**
 * (Tùy chọn) Nếu sau này bạn dùng cổng thanh toán tự động (Momo QR động, VNPay)
 * Chỉ cần bật lại hàm này và kết nối API
 */
// async function createOnlinePayment(method = 'momo') { ... }