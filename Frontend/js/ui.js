// /js/ui.js – Phiên bản HOÀN CHỈNH 2025: Toast đẹp, cập nhật profile, hiệu ứng mượt
/**
 * Hiển thị thông báo Toast chữa lành (không cần Bootstrap Toast)
 * @param {string} message - Nội dung thông báo
 * @param {string} type - success | danger | warning | info (mặc định info)
 * @param {number} duration - Thời gian hiển thị (ms), mặc định 4000
 */
function showToast(message, type = 'info', duration = 4000) {
    // Tạo container nếu chưa có
    let container = document.getElementById('mindcare-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mindcare-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Tạo toast
    const toast = document.createElement('div');
    const icons = {
        success: 'fa-heart-circle-check',
        danger: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    const colors = {
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    toast.className = 'animate__animated animate__fadeInDown';
    toast.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 1.2rem 1.5rem;
        margin-bottom: 12px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        border-left: 6px solid ${colors[type]};
        pointer-events: auto;
        max-width: 100%;
        animation: float 4s ease-in-out infinite;
    `;

    toast.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="fas ${icons[type]} fa-2x me-3" style="color: ${colors[type]};"></i>
            <div class="flex-grow-1">
                <strong class="d-block mb-1" style="color: ${colors[type]};">
                    ${type === 'success' ? 'Tuyệt vời!' : type === 'danger' ? 'Ôi không!' : type === 'warning' ? 'Chú ý' : 'Thông báo'}
                </strong>
                <span style="color: #374151; line-height: 1.5;">${message}</span>
            </div>
            <button type="button" style="
                background: none; border: none; font-size: 1.4rem; 
                color: #9ca3af; cursor: pointer; margin-left: 12px;
            " onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;

    container.appendChild(toast);

    // Tự động xóa
    setTimeout(() => {
        toast.classList.replace('animate__fadeInDown', 'animate__fadeOutUp');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

/**
 * Cập nhật thông tin người dùng trên toàn bộ trang (sidebar, header, profile...)
 */
function updateUserDisplay() {
    const userName = localStorage.getItem('userName') || 'Bạn';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userAvatar = localStorage.getItem('userAvatar') || '/images/user-avatar.jpg';

    // Cập nhật tất cả các thẻ có ID hoặc class liên quan
    document.querySelectorAll('#user-name, .user-display-name, #sidebar-user-name').forEach(el => {
        if (el) el.textContent = userName;
    });

    document.querySelectorAll('#user-email, .user-display-email, #sidebar-user-email').forEach(el => {
        if (el) el.textContent = userEmail || 'mindcare@example.com';
    });

    document.querySelectorAll('#user-avatar, .user-avatar-img').forEach(img => {
        if (img) img.src = userAvatar;
    });

    // Cập nhật tiêu đề trang nếu cần
    document.querySelectorAll('.page-title').forEach(title => {
        if (title && title.textContent.includes('Chào mừng')) {
            title.innerHTML = `Chào mừng trở lại, <strong>${userName}</strong> `;
        }
    });
}

/**
 * Hiệu ứng loading toàn trang (khi cần)
 */
function showPageLoader() {
    if (document.getElementById('page-loader')) return;

    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255,255,255,0.95); z-index: 99999;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        backdrop-filter: blur(8px);
    `;
    loader.innerHTML = `
        <i class="fas fa-heartbeat text-success mb-4" style="font-size: 4rem; animation: pulse 1.5s infinite;"></i>
        <h4 class="text-success fw-bold">MindCare đang chuẩn bị...</h4>
        <p class="text-muted">Chúng tôi luôn ở đây vì bạn</p>
    `;
    document.body.appendChild(loader);
}

function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

/**
 * Tự động chạy khi DOM sẵn sàng
 */
document.addEventListener('DOMContentLoaded', () => {
    updateUserDisplay();

    // Thêm CSS animate.css nếu chưa có
    if (!document.querySelector('link[href*="animate.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(link);
    }

    // Thêm CSS hiệu ứng float nhẹ
    if (!document.getElementById('mindcare-ui-styles')) {
        const style = document.createElement('style');
        style.id = 'mindcare-ui-styles';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
});

/**
 * Export (nếu dùng module) hoặc gắn vào window để dùng toàn cục
 */
window.showToast = showToast;
window.updateUserDisplay = updateUserDisplay;
window.showPageLoader = showPageLoader;
window.hidePageLoader = hidePageLoader;