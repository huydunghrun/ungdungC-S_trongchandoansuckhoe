// controllers/chatController.js (nếu bạn chưa có)
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const chat = async (req, res) => {
    const { message } = req.body;
    const userName = req.user?.name || 'bạn';

    if (!message || message.trim() === '') {
        return res.status(400).json({
            success: false,
            reply: 'Bạn chưa nhập tin nhắn nè. MindCare luôn sẵn sàng lắng nghe bạn!'
        });
    }

    try {
        const prompt = `
Bạn là MindCare AI – trợ lý tâm lý ấm áp, dịu dàng, nói tiếng Việt tự nhiên, dùng emoji nhẹ nhàng.
Người dùng tên là: ${userName}
Hãy trả lời thật chân thành, động viên, không phán xét.
Tin nhắn: "${message}"
        `.trim();

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        res.json({
            success: true,
            reply: reply.trim()
        });

    } catch (err) {
        console.error('Gemini AI error:', err);
        res.status(503).json({
            success: false,
            reply: 'Mình đang hơi mệt một chút, bạn gửi lại tin nhắn được không? MindCare sẽ không bỏ rơi bạn đâu!'
        });
    }
};

module.exports = { chat };