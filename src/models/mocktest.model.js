const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,  
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'  
  }],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', 
    required: true
  }
}, { timestamps: true });

const MockTest = mongoose.model('MockTest', mockTestSchema);

module.exports = MockTest;
