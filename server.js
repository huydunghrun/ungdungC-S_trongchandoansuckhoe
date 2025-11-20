// server.js
// Phiên bản HOÀN CHỈNH 2025 – MindCare Backend Ultimate Edition
// Đã tối ưu production, xử lý lỗi, graceful shutdown, logging đẹp

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Import cấu hình & utils
const connectDB = require('./config/db');
const { sendEmail } = require('./utils/email');

// Khởi tạo app
const app = express();
const server = http.createServer(app);

// ==================== SOCKET.IO SETUP ====================
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://mindcare.vn",
            "https://www.mindcare.vn",
            "https://mindcare-2025.netlify.app"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Khởi động Video Call Socket (phiên bản mới nhất)
require('./sockets/videoCall')(io);

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://mindcare.vn",
        "https://www.mindcare.vn",
        "https://mindcare-2025.netlify.app"
    ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging request (chỉ dev)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleString('vi-VN')}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// ==================== DATABASE CONNECTION ====================
connectDB();

mongoose.connection.on('connected', () => {
    console.log('MongoDB đã kết nối thành công');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB lỗi kết nối:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB đã ngắt kết nối');
});

// ==================== ROUTES ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/payment', require('./routes/payment'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'MindCare Backend',
        version: '2025 Ultimate',
        uptime: process.uptime(),
        timestamp: new Date().toLocaleString('vi-VN'),
        message: 'MindCare luôn ở đây vì bạn'
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy đường dẫn. MindCare vẫn ở đây nếu bạn cần lắng nghe'
    });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use((error, req, res, next) => {
    console.error('Lỗi server:', error);

    // Xử lý lỗi JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' });
    }

    res.status(500).json({
        success: false,
        message: 'MindCare đang gặp chút trục trặc... Nhưng chúng tôi vẫn luôn ở đây vì bạn. Vui lòng thử lại sau ít phút'
    });
});

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = (signal) => {
    console.log(`\nNhận tín hiệu ${signal} – Đang tắt server MindCare...`);
    server.close(() => {
        console.log('Đã đóng tất cả kết nối HTTP');
        mongoose.connection.close(false, () => {
            console.log('Đã đóng kết nối MongoDB');
            console.log('MindCare đã tạm biệt – Hẹn sớm gặp lại bạn!');
            process.exit(0);
        });
    });

    // Force close sau 10 giây nếu còn kết nối
    setTimeout(() => {
        console.error('Force shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║               MINDCARE 2025 ULTIMATE              ║');
    console.log('║               ĐÃ KHỞI ĐỘNG THÀNH CÔNG             ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MindCare – Luôn ở đây vì bạn`);
});

module.exports = { app, server, io };