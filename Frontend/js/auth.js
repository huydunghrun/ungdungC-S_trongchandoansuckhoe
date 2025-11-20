// Frontend/js/auth.js – PHIÊN BẢN HOÀN CHỈNH 2025 (đã fix hết lỗi, chuẩn nhất Việt Nam)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || 'patient';

    // ================== 1. BẢO VỆ TRANG & ĐIỀU HƯỚNG ĐÚNG ==================
    const protectedPages = [
        'dashboard-patient.html',
        'appointment.html', 'diagnosis.html', 'history.html',
        'chat.html', 'call.html', 'profile.html', 'payment.html',
        'doctor.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();

    // Nếu đã đăng nhập mà đang ở trang công khai → đẩy vào dashboard ngay
    if (token && (currentPage === 'index.html' || currentPage === '' || 
        currentPage === 'login.html' || currentPage === 'register.html')) {
        
        if (userRole === 'doctor') {
            window.location.href = 'doctor.html';
        } else {
            window.location.href = 'dashboard-patient.html';
        }
        return; // Dừng luôn, không chạy tiếp
    }

    // Nếu chưa đăng nhập mà vào trang bảo vệ → đá về login
    if (!token && protectedPages.includes(currentPage)) {
        alert('Vui lòng đăng nhập để tiếp tục ❤️');
        window.location.href = 'login.html';
        return;
    }

    // ================== 2. XỬ LÝ FORM ĐĂNG NHẬP ==================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email')?.value.trim();
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu');
                return;
            }

            try {
                // Đúng port backend của bạn (5001)
                const res = await fetch('http://localhost:5001/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    // Lưu đầy đủ thông tin
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userName', data.user.name || data.user.fullname || 'Bạn');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userRole', data.user.role || 'patient');
                    localStorage.setItem('userAvatar', data.user.avatar || '/img/user-avatar.png');

                    alert(`Xin chào ${data.user.name || 'Bạn'}! Chào mừng trở lại MindCare ❤️`);

                    // Chuyển hướng đúng role
                    if (data.user.role === 'doctor') {
                        window.location.href = 'doctor.html';
                    } else {
                        window.location.href = 'dashboard-patient.html';
                    }
                } else {
                    alert(data.message || 'Email hoặc mật khẩu không đúng');
                }
            } catch (err) {
                console.error('Lỗi kết nối server:', err);
                alert('Không kết nối được với máy chủ. Bạn đang chạy backend chưa?');
            }
        });
    }

    // ================== 3. XỬ LÝ FORM ĐĂNG KÝ ==================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (!name || !email || !password) {
                alert('Vui lòng điền đầy đủ thông tin');
                return;
            }
            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp');
                return;
            }

            try {
                const res = await fetch('http://localhost:5001/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục ❤️');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Email đã được sử dụng');
                }
            } catch (err) {
                console.error('Lỗi đăng ký:', err);
                alert('Không kết nối được với máy chủ');
            }
        });
    }

    // ================== 4. NÚT ĐĂNG XUẤT (nếu có) ==================
    const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('[onclick="logout()"]');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                localStorage.clear();
                alert('Đã đăng xuất thành công. Hẹn gặp lại bạn nhé ❤️');
                window.location.href = 'index.html';
            }
        };
    }
});