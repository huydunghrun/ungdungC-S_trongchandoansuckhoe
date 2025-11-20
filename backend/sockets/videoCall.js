// sockets/videoCall.js
// Phiên bản HOÀN CHỈNH 2025 – Video Call 1-1 chữa lành
// Dùng Socket.IO rooms thông minh → không cần Map thủ công
// Hoàn toàn tương thích với video.js frontend đã gửi trước đó

const initVideoCallSocket = (io) => {
    // Namespace riêng cho video call (tùy chọn, an toàn hơn)
    const videoNamespace = io.of('/video');

    videoNamespace.on('connection', (socket) => {
        console.log(`User connected to video namespace: ${socket.id}`);

        /**
         * 1. Người dùng tham gia phòng (bệnh nhân hoặc bác sĩ)
         * Frontend gửi: { roomId, peerId, userName, role }
         */
        socket.on('join-room', ({ roomId, peerId, userName = 'Người dùng', role = 'patient' }) => {
            if (!roomId || !peerId) {
                return socket.emit('error', { message: 'Thiếu roomId hoặc peerId' });
            }

            // Tham gia room
            socket.join(roomId);

            // Lưu thông tin vào socket để dùng khi disconnect
            socket.roomId = roomId;
            socket.peerId = peerId;
            socket.userName = userName;
            socket.role = role;

            // Thông báo cho người còn lại trong phòng
            socket.to(roomId).emit('user-joined', {
                peerId,
                userName,
                role,
                message: `${userName} (${role === 'doctor' ? 'Bác sĩ' : 'Bạn'}) đã tham gia phòng tư vấn`
            });

            console.log(`${userName} (${role}) joined room: ${roomId} | PeerID: ${peerId}`);
        });

        /**
         * 2. Chuyển tiếp tín hiệu WebRTC (offer, answer, ice-candidate)
         */
        socket.on('webrtc-signal', ({ toPeerId, signal, type }) => {
            // Gửi tín hiệu đến đúng peerId (nếu cần), hoặc broadcast trong room
            socket.to(socket.roomId).emit('webrtc-signal', {
                fromPeerId: socket.peerId,
                fromName: socket.userName,
                signal,
                type // 'offer' | 'answer' | 'ice-candidate'
            });
        });

        /**
         * 3. Khi người dùng rời phòng hoặc mất kết nối
         */
        socket.on('disconnect', (reason) => {
            if (!socket.roomId) return;

            console.log(`${socket.userName || 'User'} disconnected from room: ${socket.roomId} | Reason: ${reason}`);

            // Thông báo cho người còn lại
            socket.to(socket.roomId).emit('user-left', {
                peerId: socket.peerId,
                userName: socket.userName,
                role: socket.role,
                message: `${
                    socket.role === 'doctor' ? 'Bác sĩ' : 'Bạn'
                } đã rời khỏi phòng tư vấn. Cuộc gọi kết thúc.`
            });

            // Rời room
            socket.leave(socket.roomId);
        });

        /**
         * 4. Kết thúc cuộc gọi chủ động (từ nút "Kết thúc")
         */
        socket.on('end-call', () => {
            socket.to(socket.roomId).emit('call-ended', {
                message: 'Cuộc gọi đã được kết thúc.',
                by: socket.userName
            });

            // Có thể xóa room nếu cần
            // videoNamespace.in(socket.roomId).disconnectSockets(true);
        });
    });
};

module.exports = initVideoCallSocket;