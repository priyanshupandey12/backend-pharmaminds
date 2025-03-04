

const cloudinary=require('cloudinary').v2;


cloudinary.config({
   cloud_name:process.env.CLOUDINARY_NAME,
   api_key:process.env.CLOUDINARY_KEY_ID,
   api_secret:process.env.CLOUDINARY_KEY_SECRET
})



module.exports=cloudinary







