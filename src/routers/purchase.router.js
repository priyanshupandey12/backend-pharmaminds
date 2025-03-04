const express=require('express');
const router=express.Router();
const {createPayment,webhook}=require('../controllers/purchase.controller');
const authorizeRole = require('../middleware/auth.middleware');

router.route('/create-payment').post(authorizeRole(['student','teacher','admin']),createPayment)
router.route("/webhook").post(express.raw({ type: "application/json" }),webhook)

module.exports=router
