// controllers/diagnosisController.js
const Diagnosis = require('../models/Diagnosis');

const submitDiagnosis = async (req, res) => {
    const { scoreData, totalScore, level } = req.body;
    const userId = req.user.id;

    try {
        const advice = generateAdvice(totalScore, level);

        const diagnosis = new Diagnosis({
            userId,
            scoreData,
            totalScore,
            level,
            advice
        });

        await diagnosis.save();

        res.json({
            success: true,
            message: 'MindCare đã nhận kết quả của bạn. Cảm ơn bạn đã tin tưởng chia sẻ!',
            result: {
                level,
                score: totalScore,
                advice
            }
        });
    } catch (err) {
        throw err;
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await Diagnosis.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-scoreData -__v')
            .lean();

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (err) {
        throw err;
    }
};

// Tạo lời khuyên ấm áp theo điểm số
const generateAdvice = (score, level) => {
    if (score <= 9) return 'Bạn đang có sức khỏe tâm lý rất tốt! Hãy tiếp tục giữ gìn và lan tỏa năng lượng tích cực nhé';
    if (score <= 16) return 'Bạn đang có một vài dấu hiệu cần chú ý. Hãy dành thời gian nghỉ ngơi, trò chuyện với người thân và thử thiền mỗi ngày';
    if (score <= 25) return 'Tình trạng của bạn đang ở mức cần quan tâm. Hãy cân nhắc đặt lịch tư vấn với chuyên gia tâm lý sớm để được hỗ trợ kịp thời';
    return 'Bạn đang trải qua giai đoạn rất khó khăn. Hãy đặt lịch tư vấn ngay hôm nay. MindCare và các bác sĩ luôn ở đây, sẵn sàng đồng hành cùng bạn';
};

module.exports = { submitDiagnosis, getHistory };