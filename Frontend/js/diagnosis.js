// /js/diagnosis.js – Phiên bản HOÀN CHỈNH 2025, đẹp & chữa lành
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPage === 'function') initPage();

    // === Danh sách 16 câu hỏi chuẩn PHQ-9 + GAD-7 (tiếng Việt chuẩn y khoa) ===
    const diagnosisQuestions = [
        // PHQ-9: Trầm cảm
        { id: 'q1',  text: "Trong 2 tuần qua, bạn cảm thấy buồn bã, chán nản hoặc tuyệt vọng hầu như mỗi ngày?" },
        { id: 'q2',  text: "Bạn mất hứng thú hoặc niềm vui với hầu hết các hoạt động?" },
        { id: 'q3',  text: "Bạn gặp khó khăn về giấc ngủ (khó ngủ, ngủ quá nhiều hoặc thức dậy sớm)?" },
        { id: 'q4',  text: "Bạn cảm thấy mệt mỏi hoặc thiếu năng lượng gần như mỗi ngày?" },
        { id: 'q5',  text: "Bạn ăn ít hơn hoặc ăn nhiều hơn bình thường?" },
        { id: 'q6',  text: "Bạn cảm thấy bản thân vô dụng hoặc tội lỗi quá mức?" },
        { id: 'q7',  text: "Bạn khó tập trung khi làm việc, đọc sách hoặc xem TV?" },
        { id: 'q8',  text: "Bạn di chuyển hoặc nói chậm hơn bình thường, hoặc ngược lại – bồn chồn, không ngồi yên được?" },
        { id: 'q9',  text: "Bạn từng nghĩ rằng mình sẽ tốt hơn nếu không còn tồn tại hoặc muốn tự làm hại bản thân?" },

        // GAD-7: Lo âu
        { id: 'q10', text: "Bạn cảm thấy lo lắng, căng thẳng hoặc bồn chồn quá mức?" },
        { id: 'q11', text: "Bạn không thể ngừng hoặc kiểm soát được sự lo lắng?" },
        { id: 'q12', text: "Bạn lo lắng quá nhiều về nhiều việc khác nhau?" },
        { id: 'q13', text: "Bạn thấy khó thư giãn?" },
        { id: 'q14', text: "Bạn bồn chồn đến mức khó ngồi yên một chỗ?" },
        { id: 'q15', text: "Bạn dễ cáu gắt hoặc bực tức hơn bình thường?" },
        { id: 'q16', text: "Bạn cảm thấy sợ hãi như thể có điều gì đó tồi tệ sắp xảy ra?" }
    ];

    const container = document.getElementById('questions-container');
    if (!container) return;

    // Tạo câu hỏi với hiệu ứng fade-in đẹp
    diagnosisQuestions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'diagnosis-question mb-5 p-4 rounded-4 shadow-sm border-start border-success border-5 bg-light';
        div.style.opacity = '0';
        div.style.transform = 'translateY(30px)';

        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="fw-bold text-success">
                    <span class="badge bg-success rounded-pill me-3">${index + 1}</span>
                    ${q.text}
                </h5>
            </div>
            <select class="form-select form-select-lg shadow-sm" name="${q.id}" required>
                <option value="" disabled selected>Chọn mức độ của bạn trong 2 tuần qua...</option>
                <option value="0">0 – Không hề</option>
                <option value="1">1 – Vài ngày</option>
                <option value="2">2 – Hơn nửa thời gian</option>
                <option value="3">3 – Gần như mỗi ngày</option>
            </select>
        `;

        container.appendChild(div);

        // Hiệu ứng xuất hiện tuần tự
        setTimeout(() => {
            div.style.transition = 'all 0.8s ease';
            div.style.opacity = '1';
            div.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Xử lý submit
    const form = document.getElementById('extendedDiagnosis');
    if (form) {
        form.addEventListener('submit', handleDiagnosisSubmit);
    }
});

/**
 * Xử lý gửi kết quả chẩn đoán
 */
async function handleDiagnosisSubmit(e) {
    e.preventDefault();

    const resultDiv = document.getElementById('result');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Hiệu ứng loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Đang phân tích...`;

    const formData = new FormData(e.target);
    const answers = {};
    let totalScore = 0;

    for (let [key, value] of formData.entries()) {
        const score = parseInt(value);
        answers[key] = score;
        totalScore += score;
    }

    // Tính mức độ (theo chuẩn y khoa)
    const phq9Score = Object.keys(answers).slice(0, 9).reduce((sum, k) => sum + answers[k], 0);
    const gad7Score = totalScore - phq9Score;

    let level = '';
    let color = '';
    let advice = '';

    if (totalScore <= 4) {
        level = 'Tâm lý ổn định';
        color = 'success';
        advice = 'Bạn đang có sức khỏe tâm lý rất tốt! Hãy tiếp tục duy trì lối sống lành mạnh và chia sẻ niềm vui mỗi ngày';
    } else if (totalScore <= 9) {
        level = 'Triệu chứng nhẹ';
        color = 'info';
        advice = 'Bạn đang có một vài dấu hiệu cần chú ý. Hãy nghỉ ngơi nhiều hơn, trò chuyện với người thân và thử thiền mỗi ngày';
    } else if (totalScore <= 16) {
        level = 'Cần theo dõi';
        color = 'warning';
        advice = 'Tình trạng của bạn đang ở mức cần quan tâm. Hãy cân nhắc trò chuyện với chuyên gia tâm lý sớm để được hỗ trợ kịp thời';
    } else {
        level = 'Cần hỗ trợ ngay';
        color = 'danger';
        advice = 'Bạn đang trải qua giai đoạn khó khăn. Hãy đặt lịch tư vấn với bác sĩ tâm lý ngay hôm nay. Bạn không hề đơn độc';
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/diagnosis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                scoreData: Object.fromEntries(formData),
                totalScore,
                phq9Score,
                gad7Score,
                level
            })
        });

        if (res.ok) {
            // Hiển thị kết quả đẹp như một "bản báo cáo chữa lành"
            resultDiv.innerHTML = `
                <div class="text-center py-5 px-4 rounded-5 shadow-lg" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 3px solid #22c55e;">
                    <i class="fas fa-heart-circle-check text-success" style="font-size: 5rem;"></i>
                    <h2 class="mt-4 fw-bold text-success">Hoàn thành chẩn đoán!</h2>
                    <div class="my-4">
                        <div class="display-1 fw-bold text-${color}">${totalScore}<small class="fs-3">/48</small></div>
                        <div class="badge bg-${color} fs-4 px-4 py-3 rounded-pill mt-3">
                            ${level}
                        </div>
                    </div>
                    <p class="lead text-dark px-4">${advice}</p>
                    <div class="mt-4">
                        <p class="text-muted small">
                            <i class="fas fa-info-circle me-2"></i>
                            Đây chỉ là công cụ sàng lọc. Chẩn đoán chính thức cần gặp bác sĩ tâm lý.
                        </p>
                    </div>
                    <div class="mt-4">
                        <a href="/history.html" class="btn btn-outline-success btn-lg rounded-pill me-3">
                            Xem lịch sử
                        </a>
                        ${totalScore > 12 
                            ? `<a href="/appointment.html" class="btn btn-danger btn-lg rounded-pill px-5 shadow">
                                 Tư vấn ngay với bác sĩ
                               </a>`
                            : `<a href="/chat.html" class="btn btn-success btn-lg rounded-pill px-5 shadow">
                                 Nói chuyện với AI
                               </a>`
                        }
                    </div>
                </div>
            `;
        } else {
            throw new Error('Lỗi server');
        }
    } catch (err) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger rounded-4 shadow">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Không thể gửi kết quả. Vui lòng kiểm tra mạng và thử lại.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}