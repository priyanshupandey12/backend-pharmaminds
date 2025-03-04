const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true
    },
    description: { 
      type: String
    },
    category: {
      type: String,
      required: true
    },
    courseLevel: {
      type: String,
      enum: ["Beginner", "Medium", "Advance"]
    },
    coursePrice: {
      type: Number
    },
    courseThumbnail: {
      type: String
    },
    sections: [
      {
        title: { type: String },
        lectures: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
          }
        ]
      }
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
   instructor:[ {
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
