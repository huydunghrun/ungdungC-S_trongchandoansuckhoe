// Frontend/js/include.js – PHIÊN BẢN HOÀN CHỈNH 2025 (đã fix dashboard + lấy dữ liệu từ MongoDB)

async function includeHTML() {
    const elements = document.querySelectorAll('[w3-include-html]');
    if (elements.length === 0) return;

    const promises = Array.from(elements).map(async (elmnt) => {
        const file = elmnt.getAttribute('w3-include-html');
        if (!file) return;

        try {
            const response = await fetch(file, { cache: "no-store" });
            if (response.ok) {
                elmnt.innerHTML = await response.text();
            } else if (response.status === 404) {
                elmnt.innerHTML = `<div class="text-danger p-3">Không tìm thấy: ${file}</div>`;
            }
        } catch (err) {
            elmnt.innerHTML = `<div class="text-danger p-3">Lỗi mạng: ${file}</div>`;
            console.error('Include HTML error:', err);
        } finally {
            elmnt.removeAttribute('w3-include-html');
        }
    });

    await Promise.all(promises);
}

// ================================
// LẤY THÔNG TIN USER TỪ MONGODB QUA API
// ================================
async function fetchUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('http://localhost:5001/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Lưu vào localStorage để sidebar dùng
            localStorage.setItem('userName', user.name || user.fullname || 'Bạn');
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userAvatar', user.avatar || '/img/user-avatar.png');
            localStorage.setItem('userRole', user.role || 'patient');

            return user;
        } else {
            // Token hết hạn hoặc lỗi → xóa luôn
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userAvatar');
            return null;
        }
    } catch (err) {
        console.error('Lỗi lấy thông tin user:', err);
        return null;
    }
}

// ================================
// CẬP NHẬT SIDEBAR + ACTIVE MENU
// ================================
function updateSidebarActiveAndUserInfo() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    // Active menu
    document.querySelectorAll('.sidebar .nav-link, .sidebar-doctor .nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href') || '';

        if (href && (
            currentPath.endsWith(href) ||
            (currentFile === 'index.html' && href === 'index.html') ||
            (currentFile.includes('dashboard') && href.includes('dashboard')) ||
            (currentFile === 'call.html' && href.includes('call.html'))
        )) {
            link.classList.add('active');
        }
    });

    // Hiển thị tên + email + avatar
    const userName = localStorage.getItem('userName') || 'Bạn';
    const userEmail = localStorage.getItem('userEmail') || 'mindcare@example.com';
    const userAvatar = localStorage.getItem('userAvatar') || '/img/user-avatar.png';

    document.querySelectorAll('#user-name, #sidebar-user-name, .user-display-name')
            .forEach(el => el && (el.textContent = userName));

    document.querySelectorAll('#user-email, #sidebar-user-email')
            .forEach(el => el && (el.textContent = userEmail));

    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl) avatarEl.src = userAvatar;
}

// ================================
// KIỂM TRA ĐĂNG NHẬP & ĐIỀU HƯỚNG ĐÚNG DASHBOARD
// ================================
async function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const currentFile = window.location.pathname.split('/').pop();

    // Nếu đang ở trang công khai mà đã đăng nhập → chuyển vào dashboard
    if (token && (currentFile === 'index.html' || currentFile === '' || currentFile === 'login.html' || currentFile === 'register.html')) {
        const user = await fetchUserInfo();
        if (user) {
            window.location.href = 'dashboard-patient.html';  // ← ĐÚNG TÊN FILE
        }
    }

    // Nếu đang ở dashboard mà không có token → đá về trang chủ
    if (!token && currentFile.includes('dashboard')) {
        window.location.href = 'index.html';
    }
}

// ================================
// KHỞI TẠO TRANG
// ================================
async function initPage() {
    try {
        await checkAuthAndRedirect();    // ← Kiểm tra đăng nhập trước
        await includeHTML();             // ← Tải sidebar, header...
        await fetchUserInfo();           // ← Lấy tên, email, avatar từ MongoDB
        updateSidebarActiveAndUserInfo(); // ← Hiển thị lên giao diện
    } catch (err) {
        console.error('Init page error:', err);
    }
}

// Tự động chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[w3-include-html]') || document.querySelector('.sidebar')) {
        initPage();
    } else {
        // Trang công khai (index, login, register) vẫn cần check redirect
        checkAuthAndRedirect();
    }
});