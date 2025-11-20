    // /js/video.js

    document.addEventListener('DOMContentLoaded', () => {
        // Chỉ khởi tạo PeerJS sau khi có media
        // Hàm này phải được gọi thủ công bằng initPage() trong HTML
        if (typeof initPage === 'function') initPage();
        getLocalMedia();
    });

    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const roomIdInput = document.getElementById('roomId');

    let localStream;
    let peer;
    let currentCall;

    // --- 1. KẾT NỐI SOCKET.IO ---
    // Tải socket.io.js trong HTML
    const socket = io(); 

    // --- 2. THIẾT LẬP PEERJS ---
    function setupPeer() {
        // Khởi tạo PeerJS với các tham số server
        peer = new Peer(undefined, {
            host: '/',
            port: '443', 
            secure: true 
        });

        peer.on('open', id => {
            console.log('Peer ID của tôi là:', id);
        });

        // Lắng nghe cuộc gọi đến
        peer.on('call', call => {
            currentCall = call;
            call.answer(localStream); // Trả lời bằng local stream
            call.on('stream', addRemoteStream);
            call.on('close', () => alert('Cuộc gọi đã kết thúc.'));
        });
    }

    // --- 3. LẤY LUỒNG MEDIA CỤC BỘ ---
    async function getLocalMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            setupPeer();
            return localStream;
        } catch (err) {
            alert('Không thể truy cập camera và microphone.');
        }
    }

    // --- 4. HÀM HIỂN THỊ REMOTE STREAM ---
    function addRemoteStream(stream) {
        remoteVideo.srcObject = stream;
    }

    // --- 5. HÀM THỰC HIỆN CUỘC GỌI ---
    function callUser(peerIdToCall) {
        currentCall = peer.call(peerIdToCall, localStream);
        currentCall.on('stream', addRemoteStream);
        currentCall.on('close', () => alert('Cuộc gọi đã kết thúc.'));
    }

    // --- 6. HÀM THAM GIA PHÒNG (Được gọi từ nút HTML) ---
    function join() {
        const roomId = roomIdInput.value;
        if (!roomId || !peer || !peer.id) {
            alert('Lỗi: Peer chưa sẵn sàng hoặc thiếu Room ID.');
            return;
        }
        
        // Báo hiệu tham gia phòng qua Socket.IO
        socket.emit('join-video-room', roomId, peer.id);
    }

    // --- 7. XỬ LÝ SỰ KIỆN TỪ SOCKET.IO SERVER ---
    socket.on('user-connected', peerId => {
        // Nếu có người dùng mới tham gia, gọi họ
        callUser(peerId);
    });