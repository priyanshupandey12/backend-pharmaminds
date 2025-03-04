const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
  },
  videos: [
    {
      videoUrl: String,
      publicId: String
    }
  ],
  isPreviewFree: {
     type: Boolean ,
     default: false
    },
},{timestamps:true});

module.exports = Lecture = mongoose.model("Lecture", lectureSchema);