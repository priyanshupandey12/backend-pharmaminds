const express=require('express');
const router=express.Router();
const {getCourseProgress,updateLectureProgress,markAsCompleted,markAsInCompleted}=require('../controllers/progress.controller');
const authorizeRole=require('../middleware/auth.middleware');



router.route("/course-progress/:courseId").get(authorizeRole(["admin", "student"]), getCourseProgress);
router.route("/:courseId/lectures/:lectureId").post(authorizeRole(["student", "admin"]), updateLectureProgress);
router.route("/mark/:courseId/lectures/:lectureId").post(authorizeRole(["student", "admin"]), markAsCompleted);
router.route("/unmark/:courseId/lectures/:lectureId").post(authorizeRole(["student", "admin"]), markAsInCompleted);
module.exports=router