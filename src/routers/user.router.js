const express=require('express');
const router=express.Router();
const upload=require('../middleware/multer.middleware');

const {registerUser,loginUser,logoutUser,viewProfile,updateProfile,getallusers,updateUserbyId,getuserbyid,deleteUser}=require('../controllers/user.controller');

const authorizeRole=require('../middleware/auth.middleware');


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/').get(getallusers);
router.route('/logout').get(logoutUser);
router.route('/profile').get(authorizeRole(['admin', 'student', 'teacher']),viewProfile);
router.route('/update-profile').patch(authorizeRole(['admin', 'student', 'teacher']), upload.single("profilePicture"),updateProfile);
router.route('/:id').delete(authorizeRole(['admin']),deleteUser);
router.route('/:id').get(authorizeRole(['admin']),getuserbyid)
router.route('/:id').patch(authorizeRole(['admin']),updateUserbyId)

module.exports=router;