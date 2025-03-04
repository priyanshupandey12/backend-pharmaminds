const mongoose=require('mongoose');


const purchaseSchema=new mongoose.Schema({
 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    receipt: {
      type: String,
      required: true,
    },
    status: {
        type: String,
        required: true,
      },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
},{timestamps:true})

const Purchase=mongoose.model("Purchase",purchaseSchema);

module.exports=Purchase