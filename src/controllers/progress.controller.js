const Progress=require("../models/courseprogress.model")
const Course=require("../models/course.model")

const getCourseProgress=async(req,res)=>{
     try {
      const {courseId}=req.params;
      const userId=req.user._id;

      let courseprogress=await Progress.findOne({userId:userId,courseId:courseId}).populate("courseId");

      const coursedetails=await Course.findById(courseId);

   if(!coursedetails){
    return res.status(400).json({error:"Course not found"})
   }

   if(!courseprogress){
    return res.status(200).json({data:{
      coursedetails,
      progress:[],
      compeleted:false
    }})
  }

   return res.status(200).json({data:{
    coursedetails,
    progress:courseprogress.lectureProgress,
    compeleted:courseprogress.completed
   }})

     } catch (error) {
      console.log(error);
     }



}


const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id;

    let courseProgress = await Progress.findOne({ courseId, userId });

    
    if (!courseProgress) {
      courseProgress = new Progress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

   
    const lectureIndex = courseProgress.lectureProgress.findIndex(lecture => lecture.lectureId === lectureId);

    if (lectureIndex !== -1) {
      
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
    
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }

    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    
    let totalLectures = 0;
    course.sections.forEach(section => {
      totalLectures += section.lectures.length;
    });

    const completedLectures = courseProgress.lectureProgress.filter(lecture => lecture.viewed).length;

  
    courseProgress.completed = completedLectures === totalLectures;

   
    await courseProgress.save();

    return res.status(200).json({ message: "Lecture progress updated", data: courseProgress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", message: error.message });
  }
};





const markAsCompleted = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id;

    let courseProgress = await Progress.findOne({ courseId, userId });

 
    if (!courseProgress) {
      courseProgress = new Progress({
        courseId,
        userId,
        lectureProgress: [],
        completed: false
      });
    }


    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }


    const course = await Course.findById(courseId);
    const totalLectures = course.sections.flatMap((s) => s.lectures).length;
    const completedLectures = courseProgress.lectureProgress.filter((l) => l.viewed).length;

    courseProgress.completed = completedLectures === totalLectures;

    await courseProgress.save();

    return res.status(200).json({ message: "Lecture marked as completed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const markAsInCompleted = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id;

   let courseProgress = await Progress.findOne({ courseId, userId });

    
    if (!courseProgress) {
      courseProgress = new Progress({
        courseId,
        userId,
        lectureProgress: [],
        completed: false
      });
    }

  
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = false;
    }

    
    const completedLectures = courseProgress.lectureProgress.filter((l) => l.viewed).length;
    courseProgress.completed = completedLectures === 0 ? false : courseProgress.completed;

    await courseProgress.save();

    return res.status(200).json({ message: "Lecture marked as incomplete" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports={
  getCourseProgress,
  updateLectureProgress,
  markAsCompleted,
  markAsInCompleted
}
