const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,  // e.g., ["Option A", "Option B", "Option C", "Option D"]
  }],
  correctAnswer: {
    type: String,  // The correct answer (e.g., 'Option B')
    required: true
  },
  explanation: {
    type: String  // Explanation for the correct answer
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',  // Reference to the MockTest collection
    required: true
  },
  difficultyLevel: {
    type: String,  // 'easy', 'medium', 'hard'
    required: true
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
