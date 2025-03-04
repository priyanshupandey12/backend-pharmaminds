const mongoose = require('mongoose');


const userSchema= new mongoose.Schema({
    firstName:{
      type: String,
      required: true
    },
    lastName:{
      type: String,
      required: true
    },
    email:{
      type: String,
      required: true,
      unique: true
    },
    password:{
      type: String,
      required: true
    },
    phoneNumber:{
      type: String,
     
    },
    profilePicture: {
      type: String,
       default: ""
    },



    role:{
      type: String,
      enum:['admin','student','teacher','guest'],
      default:'student'
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course' 
    }],
    mockTestResults: [{
      mockTest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest'
      },
      score: {
        type: Number,  
      },
      attemptDate: {
        type: Date,
        default: Date.now
      },
   

    }],


},{timestamps: true});

const User= mongoose.model('User',userSchema);

module.exports=User