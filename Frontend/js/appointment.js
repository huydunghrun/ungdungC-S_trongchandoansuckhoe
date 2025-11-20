// js/appointment.js
let selectedDoctorId = null;

function selectDoctor(id, element) {
    selectedDoctorId = id;
    document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
}

async function loadDoctors() {
    try {
        const res = await fetch('/api/doctors');
        const doctors = await res.json();
        const container = document.getElementById('doctorsContainer');
        container.innerHTML = doctors.map(d => `
            <div class="col-md-4">
                <div class="doctor-card" onclick="selectDoctor(${d.id}, this)">
                    <img src="${d.avatar || '/images/doctor-default.jpg'}" alt="${d.name}" class="doctor-avatar mb-3">
                    <h5 class="fw-bold">${d.name}</h5>
                    <p class="text-success small">${d.specialty}</p>
                    <small class="text-muted">4.9 (128 lượt)</small>
                </div>
                <input type="radio" name="doctorId" value="${d.id}" class="d-none" required>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById('doctorsContainer').innerHTML = '<p class="text-danger text-center">Không tải được bác sĩ</p>';
    }
}

document.getElementById('appointmentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return alert('Vui lòng chọn bác sĩ');

    const form = e.target;
    const data = {
        doctorId: selectedDoctorId,
        date: form.appointmentDate.value,
        time: form.appointmentTime.value,
        reason: form.reason.value.trim()
    };

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            alert('Đặt lịch thành công! Đang chuyển sang thanh toán...');
            localStorage.setItem('pendingAppointmentId', result.id);
            window.location.href = '/payment.html';
        } else {
            alert(result.message || 'Lỗi đặt lịch');
        }
    } catch (err) {
        alert('Lỗi kết nối');
    }
});

loadDoctors();