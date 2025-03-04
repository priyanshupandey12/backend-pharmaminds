const express=require('express');
const router=express.Router();
const upload=require('../middleware/multer.middleware');
const {createCourse,getAllCourses,
  getcourseById,updateCourse,deleteCourse,searchCourses,togglePublishCourse,getpublishCourses,getEnrolledCourses,
  createLecture,getlecture,updateLecture,deleteLectureVideo,getLectureById

}=require('../controllers/course.controller');

const authorizeRole=require('../middleware/auth.middleware');


router.route('/create').post(authorizeRole(['admin', 'teacher']),createCourse);
router.route('/search').get(authorizeRole(['admin','student']),searchCourses);
router.get("/enrolled-courses",authorizeRole(['student','admin']) , getEnrolledCourses);
router.route('/get').get(getpublishCourses);
router.route('/').get(authorizeRole(['admin']),getAllCourses);
router.route('/:id').get(authorizeRole(['admin','student']),getcourseById);
router.route('/:id').patch(authorizeRole(['admin']),upload.single("courseThumbnail"),updateCourse);
router.route('/:id').delete(authorizeRole(['admin']),deleteCourse);
router.route('/publish/:courseId').patch(authorizeRole(['admin']),togglePublishCourse);

router.route('/:courseId/lectures').post(authorizeRole(['admin']),upload.single('video'),createLecture);
router.route('/:courseId/lectures').get(authorizeRole(['admin','student']),getlecture);
router.route('/:courseId/lectures/:lectureId').get(authorizeRole(['admin','student']),getLectureById);
router.route('/:courseId/lectures/:lectureId').patch(authorizeRole(['admin']),upload.single('video'),updateLecture)
router.route('/:lectureId/videos/:videoId').delete(authorizeRole(['admin']),deleteLectureVideo)



module.exports=router;
