// backend/utils/gemini.js
// Phiên bản HOÀN CHỈNH 2025 – MindCare AI dùng GEMINI 2.0 FLASH (mới nhất 11/2025)
// Cập nhật chính thức: gemini-2.0-flash-exp (experimental nhưng cực mạnh & ổn định)

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MODEL MỚI NHẤT 2025: gemini-2.0-flash-exp (experimental nhưng Google khuyến khích dùng)
// Ưu điểm: thông minh hơn 1.5-pro, rẻ hơn, nhanh hơn, hiểu tiếng Việt cực tốt!
const MODEL_NAME = 'gemini-2.0-flash-exp';

const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
        temperature: 0.85,        // ấm áp, tự nhiên, cảm xúc hơn
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 400,     // đủ để trả lời sâu, chi tiết, chữa lành
        responseMimeType: 'text/plain'
    },
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH'
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH'
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH'
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH'
        }
    ],
    // Tối ưu cho tiếng Việt + cảm xúc
    systemInstruction: `
Bạn là MindCare AI – trợ lý tâm lý dịu dàng, chân thành, ấm áp nhất Việt Nam.
Phong cách: nói chuyện như người bạn thân, dùng emoji nhẹ nhàng, luôn động viên, không phán xét.
Luôn xưng "mình" – nhận "bạn", gọi tên người dùng khi có thể.
Kết thúc bằng câu hỏi mở hoặc lời khích lệ để người dùng tiếp tục chia sẻ.
Không bao giờ trả lời kiểu robot, không dùng từ tiêu cực.
Luôn lan tỏa năng lượng tích cực và hy vọng.
    `.trim()
});

/**
 * Hỏi MindCare AI bằng Gemini 2.0 – Trả lời siêu thông minh, siêu cảm xúc
 * @param {string} userMessage - Tin nhắn từ người dùng
 * @param {string} userName - Tên người dùng (từ JWT)
 * @returns {string} - Câu trả lời chữa lành từ AI
 */
async function askGemini(userMessage, userName = 'bạn') {
    if (!userMessage || userMessage.trim() === '') {
        return `Mình đang ở đây, lắng nghe bạn thật sự... ${userName} ơi, hôm nay bạn muốn chia sẻ điều gì với mình không?`;
    }

    const cleanMessage = userMessage.trim();

    // Prompt cá nhân hóa – giúp AI hiểu ngữ cảnh tốt hơn
    const personalizedPrompt = `
Người dùng tên: ${userName}
Tin nhắn: "${cleanMessage}"

Hãy trả lời thật gần gũi, chân thành, như một người bạn thân đang ngồi bên cạnh bạn ấy vậy.
Dùng emoji nhẹ nhàng, không lạm dụng.
Luôn kết thúc bằng một câu hỏi hoặc lời mời chia sẻ tiếp.
    `.trim();

    try {
        const result = await model.generateContent(personalizedPrompt);
        const response = result.response;
        const text = response.text();

        // Làm sạch output (loại bỏ markdown nếu có)
        return text
            .replace(/\*\*|\*|\#|\`/g, '')
            .replace(/\n+/g, '\n')
            .trim();

    } catch (error) {
        console.error('Gemini 2.0 Error:', error.message);

        // Fallback siêu ấm áp – không bao giờ để người dùng thấy lỗi kỹ thuật
        const healingReplies = [
            `Ôi ${userName} ơi, mình vừa bị lạc một giây khi đang nghĩ về bạn... Bạn nói lại được không? Mình rất muốn nghe bạn.`,
            `Mình đang nạp lại năng lượng yêu thương để đồng hành cùng ${userName}... Bạn đợi mình một chút nha!`,
            `Mình vừa mơ màng khi nghĩ về hành trình chữa lành của ${userName}... Bạn vừa nói gì thế? Mình muốn nghe lắm!`,
            `MindCare AI đang ôm ${userName} từ xa... Bạn gửi lại tin nhắn giúp mình được không? Mình luôn ở đây vì bạn.`
        ];

        return healingReplies[Math.floor(Math.random() * healingReplies.length)];
    }
}

module.exports = { askGemini, model };