// models/Diagnosis.js
const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scoreData: Object,
    totalScore: Number,
    level: String,
    advice: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);