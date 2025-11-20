const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
    const { doctorId, date, time, reason } = req.body;
    const userId = req.user.id;

    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                doctorId: Number(doctorId),
                date: new Date(date),
                time,
                reason,
                status: 'pending'
            }
        });
        res.json({ appointmentId: appointment.id, message: 'Đặt lịch thành công!' });
    } catch (e) {
        res.status(400).json({ message: 'Không thể đặt lịch (thời gian đã bị đặt)' });
    }
};

const getDoctors = async (req, res) => {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
};

module.exports = { createAppointment, getDoctors };