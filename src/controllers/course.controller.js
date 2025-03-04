const Course=require('../models/course.model')

const User=require('../models/user.model')
const Lecture=require('../models/lecture.model')
const cloudinary =require('../utils/cloudinary');
const fs=require('fs')

const createCourse = async (req, res) => {
  const { courseTitle, category, instructorName } = req.body;

  try {
    if (!courseTitle || !category || !instructorName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = req.user;


    const isAdmin = await User.findById(user._id).select("role");
    if (isAdmin.role !== "admin") {
      return res.status(401).json({ error: "You are not authorized to create a course" });
    }

 
    const instructor = await User.findOne({ firstName: instructorName }).select("_id");
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    const course = await Course.create({
      courseTitle,
      category,
      instructor: instructor._id,  
      sections: [],
    });

    if (!course) {
      return res.status(400).json({ error: "Course not created" });
    }

    return res.status(201).json({ message: "Course created successfully", data: course });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error: course cannot be created" });
  }
};



const getAllCourses = async (req, res) => {
  try {
    const user = req.user;


    const adminUser = await User.findById(user._id).select("role");
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(401).json({ error: "You are not authorized to view courses" });
    }

   
    const courses = await Course.find({}).populate("instructor" ,"firstName lastName" ).populate("sections.lectures");

    if (!courses.length) {
      return res.status(404).json({ error: "No courses found" });
    }

    return res.status(200).json({ message: "Courses fetched successfully", data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ error: "Server error: courses cannot be fetched" });
  }
};


const getcourseById=async(req,res)=>{
   try {
    const user=req.user;
    const courseId=req.params.id

    if (!user || !user._id) {
      return res.status(400).json({ error: "User information is missing" });
    }

   
  

    const course=await Course.findById(courseId).populate("instructor" ,"firstName lastName" ).populate("sections.lectures");
  

    if(!course){
      return res.status(400).json({error:"Course not found"})
    }

    return res.status(200).json({message:"Course fetched successfully",data:course})

    
   } catch (error) {
    console.log(error);
    return res.status(500).json({error:"Server error :course cannot be fetched"})
   }
}

const updateCourse = async (req, res) => {
  try {
    const user = req.user;
    let { courseTitle, description,category, courseLevel, coursePrice} = req.body;
    let thumbnail=req.file ? req.file.path : null;
    const courseId = req.params.id;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course=await Course.findById(courseId);

    if(!course){
      return res.status(400).json({error:"Course not found"})
    }
    if(course.courseThumbnail) {
      const publicId= course.courseThumbnail.split('/').pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId)
    }

    if (user.role !== 'admin') {
      return res.status(401).json({ error: "You are not authorized to update this course" });
    }
     let updatedthumbnail=course.courseThumbnail;

       if(thumbnail){
        const updatedimage=await cloudinary.uploader.upload(thumbnail,{'resource_type':"auto"});
        updatedthumbnail=updatedimage.secure_url;

       }

   //   const updatedData={courseTitle, description,category, courseLevel, coursePrice, courseThumbnail:updatedthumbnail}
   const updatedData = {
    courseTitle,
    description,
    category,
    courseLevel,
    coursePrice,
    courseThumbnail: updatedthumbnail
  };
  const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, { new: true });
  if (!updatedCourse) {
    return res.status(400).json({ error: "Course cannot be updated" });
  }
  return res.status(200).json({ message: "Course updated successfully", data: updatedCourse });
  
      


  } catch (error ) {
    console.log(error);
    return res.status(500).json({ error: "Server error: course cannot be updated" });
  }
};

const deleteCourse = async (req, res) => {

   try {
    const user = req.user;
    const courseId = req.params.id;

    if(!courseId){
      return res.status(400).json({error:"Course id is missing"})
    }

    if (!user || !user._id) {
      return res.status(400).json({ error: "User information is missing" });
    }

   
    if (user.role !== 'admin') {
      return res.status(401).json({ error: "You are not authorized to delete this course" });
    }

    const course = await Course.findByIdAndDelete(courseId);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

  
 return  res.status(200).json({ message: "Course deleted successfully" });   


   } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error: course cannot be deleted" });
   }




}


const searchCourses = async (req, res) => {
  try {
    const { search = "", sortByPrice = "" } = req.query;
    let categories = req.query.categories;

    if (categories) {
      if (!Array.isArray(categories)) {
        categories = [categories]; // Ensure it's always an array
      }
      categories = categories.filter(cat => cat && cat.trim() !== '');
    } else {
      categories = [];
    }

    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: search, $options: "i" } },
        { sections: { $elemMatch: { title: { $regex: search, $options: "i" } } } }
      ]
    };

    // Apply category filter correctly
    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1;
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1;
    }

    const courses = await Course.find(searchCriteria).sort(sortOptions);

    return res.status(200).json({
      success: true,
      courses: courses.length > 0 ? courses : []
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ error: "Server error: courses cannot be fetched" });
  }
};



const togglePublishCourse=async(req,res)=>{
  try {

    const {courseId}=req.params;
    const {publish}=req.query;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    course.isPublished= publish==='true'
    await course.save();
    const statusMessage=course.isPublished? "Published" :"UnPublished";

    return res.status(201).json({message:`course is ${statusMessage}`})
    
  } catch (error) {
    console.error("Error publish course:", error);
    return res.status(500).json({ error: "Server error: publish not happenend" });
  }
}


const getpublishCourses=async(req,res)=>{
  try {
    const course=await Course.find({isPublished:true}).populate(
      {
        path:"instructor",
        select:"firstName lastName"
      }
    ).select('-enrolledStudents -isPublished -reviews -sections -instructor');

    if(!course) {
      return res.status(401).json({message:"course is not find"});
    }

    return res.status(200).json({message:"course fetched successfulyy",course});
    
  } catch (error) {
    console.log(error);
    return res.status(401).json({error:"somthing went wrong during fetching the publish course"})
  }
}


const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


//lectures portion


const createLecture = async (req, res) => {
  const user = req.user;
  const { courseId } = req.params;
  const { sectionTitle, lectureTitle } = req.body;

  try {
    if (!courseId || !sectionTitle || !lectureTitle) {
      return res.status(400).json({ error: "Course ID, section title, and lecture title are required" });
    }
 
   

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    let lecturevideo = null;
    let publicId = null;

    if(req.file) {
      const uploadedVideo = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "lectures"
      }
     

      );
      lecturevideo = uploadedVideo.secure_url;
      publicId = uploadedVideo.public_id;
    }
 

    const newLecture = new Lecture({
      lectureTitle,
      videos: lecturevideo ? [{ videoUrl: lecturevideo, publicId: publicId }] : [],
    });


    let sectionIndex = course.sections.findIndex(sec => sec.title === sectionTitle);

    if (sectionIndex === -1) {
   
      const newSection = { title: sectionTitle, lectures: [newLecture._id] };
      course.sections.push(newSection);
    } else {
  
      course.sections[sectionIndex].lectures.push(newLecture._id);
    }

    await newLecture.save();
    await course.save();

    return res.status(201).json({ message: "Lecture added successfully", data: course });
  } catch (error) {
    console.error("Error adding lecture:", error);
    return res.status(500).json({ error: "Server error: lecture could not be added" });
  }
};


const getlecture=async(req,res)=>{
          try {
            const user=req.user
  const {courseId}=req.params 

  const course = await Course.findById(courseId).populate('sections.lectures');

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

    return res.status(200).json({ message: "Lectures fetched successfully", data: course.sections });



          } catch (error) {
            console.error("Error fetching lectures:", error);
            return res.status(500).json({ error: "Server error: lectures could not be fetched" });
          }
} 


const updateLecture = async (req, res) => {
  const { courseId, lectureId } = req.params;

  try {
    const { lectureTitle, isPreviewFree } = req.body;

    // Find the lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    // Upload new video if provided
    if (req.file) {
      const uploadedVideo = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "lectures",
      });

      lecture.videos.push({
        videoUrl: uploadedVideo.secure_url,
        publicId: uploadedVideo.public_id
      });

      // Delete the uploaded file safely
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // Update lecture details
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (typeof isPreviewFree === "boolean") {
      lecture.isPreviewFree = isPreviewFree;
    }

    await lecture.save();

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Ensure lecture is in a section
    let section = course.sections.find(sec => sec.lectures.includes(lecture._id));

    if (!section) {
      if (course.sections.length > 0) {
        course.sections[0].lectures.push(lecture._id);
      } else {
        course.sections.push({ title: "Default Section", lectures: [lecture._id] });
      }
      await course.save();
    }

    return res.status(200).json({ message: "Lecture updated successfully", lecture });

  } catch (error) {
    console.error("Error updating lecture:", error);
    return res.status(500).json({ error: "Server error: lecture could not be updated" });
  }
};



const getLectureById = async (req, res) => {
  const { courseId, lectureId } = req.params;
     const user=req.user
  try {
  
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }


    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }


    const lectureExists = course.sections.some(section => 
      section.lectures.includes(lectureId)
    );

    if (!lectureExists) {
      return res.status(404).json({ 
        error: "Lecture not found in this course" 
      });
    }
    
    return res.status(200).json({ lecture });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    return res.status(500).json({ 
      error: "Server error: could not fetch lecture" 
    });
  }
};



const deleteLectureVideo = async (req, res) => {
  const { lectureId, videoId } = req.params;
 
  const cleanVideoId = videoId.trim();

  try {
   
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

 
    const video = lecture.videos.find(v => {
      const dbVideoId = v._id.toString();
      return dbVideoId === cleanVideoId;
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found in lecture'
      });
    }

 
    await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });

   
    lecture.videos = lecture.videos.filter(v => v._id.toString() !== cleanVideoId);

 
    await lecture.save();

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteLectureVideo:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete video: ${error.message}`
    });
  }
};












module.exports={createCourse,getAllCourses,getcourseById,updateCourse,searchCourses,togglePublishCourse,getpublishCourses,getEnrolledCourses,
  createLecture,deleteCourse,getlecture,updateLecture,getLectureById,deleteLectureVideo}