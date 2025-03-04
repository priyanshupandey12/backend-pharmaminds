const Purchase = require('../models/purchase.model');
const Course = require('../models/course.model');
const User= require('../models/user.model');
const razorpayInstance = require('../utils/razorpay');
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const createPayment = async (req, res) => {
  try {
    const user = req.user._id;
    const { courseId } = req.body;


    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }


    const order = await razorpayInstance.orders.create({
      amount: course.coursePrice * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, 
    });

   
    const purchase = new Purchase({
      userId: user,
      courseId: course._id,
      amount: course.coursePrice,
      razorpayOrderId: order.id,
      currency: order.currency,
      receipt: order.receipt,
      status:order.status
    });

    await purchase.save();

    res.status(201).json({ success: true, ...purchase.toJSON(),  keyid:razorpayInstance.key_id, });

  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};

const webhook=async(req,res)=>{
  try {
    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);

   
   
   
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    console.log("Valid Webhook Signature");

    const paymentDetails = req.body.payload.payment.entity;
    console.log("Payment Details:", paymentDetails);

    const purchase = await Purchase.findOne({ razorpayOrderId: paymentDetails.order_id });

    if (!purchase) {
      console.log("Purchase not found!");
      return res.status(404).json({ success: false, msg: "Purchase record not found" });
    }

    purchase.status = paymentDetails.status === "captured" ? "success" : "failed";
    await purchase.save();
    console.log("Payment status updated in Purchase model.");
    if (purchase.status === "success") {
  
      const user = await User.findById(purchase.userId);
      const course = await Course.findById(purchase.courseId);

      if (!user || !course) {
        console.log("User or Course not found!");
        return res.status(404).json({ success: false, msg: "User or Course not found" });
      }
      if (!course.enrolledStudents.includes(user._id)) {
        course.enrolledStudents.push(user._id);
        await course.save();
        console.log("User added to course's enrolledStudents.");
      }

      if (!user.enrolledCourses.includes(course._id)) {
        user.enrolledCourses.push(course._id);
        await user.save();
        console.log("Course added to user's enrolledCourses.");
      }

      console.log("User successfully enrolled in course.");

    }
    res.status(200).json({ success: true, msg: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


module.exports = { createPayment ,webhook};
