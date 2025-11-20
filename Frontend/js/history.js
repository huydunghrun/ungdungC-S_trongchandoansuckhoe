// /js/history.js – Phiên bản hoàn chỉnh, đẹp & chuyên nghiệp
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPage === 'function') initPage();
    loadHistory();
});

const API_BASE_URL = '/api';

/**
 * Tải và hiển thị lịch sử chẩn đoán
 */
async function loadHistory() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('historyList');
    
    if (!container) return;

    // Hiệu ứng loading đẹp
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-success" style="width: 3.5rem; height: 3.5rem;"></div>
            <p class="mt-3 text-muted fs-5">Đang tải hành trình của bạn...</p>
        </div>
    `;

    try {
        const res = await fetch(`${API_BASE_URL}/diagnosis/history`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        // Xóa loading
        container.innerHTML = '';

        if (!res.ok) {
            throw new Error(data.message || 'Lỗi server');
        }

        if (data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-heart text-success" style="font-size: 4rem; opacity: 0.3;"></i>
                    <h4 class="mt-4 text-muted">Bạn chưa có kết quả chẩn đoán nào</h4>
                    <p class="text-muted">Hãy bắt đầu hành trình chăm sóc tâm lý cùng MindCare nhé</p>
                    <a href="/diagnosis.html" class="btn btn-success btn-lg rounded-pill mt-3 px-5 shadow">
                        <i class="fas fa-clipboard-check me-2"></i>Làm bài kiểm tra ngay
                    </a>
                </div>
            `;
            return;
        }

        // Sắp xếp từ mới nhất đến cũ nhất
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        data.forEach(item => {
            const date = new Date(item.createdAt).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const colorClass = getSeverityColor(item.level);
            const icon = getSeverityIcon(item.level);

            const card = document.createElement('div');
            card.className = 'card-healing mb-4 shadow-sm border-0 overflow-hidden';
            card.innerHTML = `
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="fw-bold text-success">
                                <i class="fas fa-calendar-alt me-2"></i>
                                ${date}
                            </h5>
                        </div>
                        <div class="badge bg-${colorClass} fs-6 px-4 py-2 rounded-pill">
                            <i class="${icon} me-2"></i>${item.level}
                        </div>
                    </div>
                    <p class="lead text-dark mb-3">${item.advice || 'Không có lời khuyên cụ thể'}</p>
                    ${item.score ? `<p class="text-muted small"><strong>Điểm số:</strong> ${item.score}/27 (PHQ-9 + GAD-7)</p>` : ''}
                    <div class="mt-3">
                        <a href="/diagnosis.html" class="btn btn-outline-success btn-sm rounded-pill">
                            <i class="fas fa-redo me-2"></i>Làm lại bài kiểm tra
                        </a>
                        ${item.level.includes('Nặng') || item.level.includes('Trầm trọng') 
                            ? `<a href="/appointment.html" class="btn btn-danger btn-sm rounded-pill ms-2">
                                 <i class="fas fa-video me-2"></i>Tư vấn ngay với bác sĩ
                               </a>` 
                            : ''
                        }
                    </div>
                </div>
            `;

            // Thêm hiệu ứng fade-in khi xuất hiện
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            container.appendChild(card);

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });

    } catch (err) {
        console.error('Load history error:', err);
        container.innerHTML = `
            <div class="alert alert-danger rounded-4 shadow">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Không thể tải lịch sử</strong><br>
                <small>${err.message || 'Vui lòng kiểm tra kết nối và thử lại'}</small>
            </div>
        `;
    }
}

/**
 * Lấy màu theo mức độ nghiêm trọng
 */
function getSeverityColor(level) {
    if (!level) return 'secondary';
    level = level.toLowerCase();
    if (level.includes('nặng') || level.includes('trầm trọng')) return 'danger';
    if (level.includes('trung bình') || level.includes('vừa')) return 'warning';
    if (level.includes('nhẹ')) return 'info';
    return 'success';
}

/**
 * Lấy icon phù hợp với mức độ
 */
function getSeverityIcon(level) {
    if (!level) return 'fas fa-question-circle';
    level = level.toLowerCase();
    if (level.includes('nặng') || level.includes('trầm trọng')) return 'fas fa-heart-broken';
    if (level.includes('trung bình')) return 'fas fa-exclamation-triangle';
    if (level.includes('nhẹ')) return 'fas fa-cloud';
    return 'fas fa-smile-beam';
}