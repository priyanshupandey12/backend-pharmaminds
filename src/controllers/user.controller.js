const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');  
const  cloudinary = require('../utils/cloudinary');


const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role, profilePicture } = req.body;

 

  try {

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
   
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

 
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
    
   
      profilePicture,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" ,data:{
      firstName,
      lastName,
      profilePicture
    }} );

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

  
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

   
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY, 
      { expiresIn: '24h' } 
    );

    
   
    res.cookie('token', token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 3600000,
    });
    const userData = user.toObject();
    delete userData.password; 
    delete userData.phoneNumber;  
    delete userData.role;  
    
    return res.status(200).json({ message: `Welcone back,${user.firstName}`,user: userData });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" ,error});
  }
};

const logoutUser =async (req, res) => {
  try {
    res.cookie('token', '', {maxAge: 0 
  })
  return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}


const viewProfile =async (req, res) => {
  
  try {
    const user=req.user
 
    const userProfile=await User.findById(user._id).select('-password -phoneNumber ').populate('enrolledCourses');

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    let message;
    switch (user.role) {
      case 'admin':
        message = ` Profile: ${user.firstName}`;
        break;
      case 'student':
        message = ` Profile: ${user.firstName}`;
        break;
      case 'teacher':
        message = ` Profile: ${user.firstName}`;
        break;
      default:
        message = `Profile of ${user.firstName}`;
    }

    return res.status(200).json({
      message,
      userProfile,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }

}

const updateProfile = async (req, res) => {


 

  try {
    const userId = req.user._id;
    const {firstName,lastName}=req.body;
    const file = req.file ? req.file.path : null;

    const validUser = await User.findById(userId);

    if (!validUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if(validUser.profilePicture) {
      const publicId= validUser.profilePicture.split('/').pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId)
    }
    let photoUrl = validUser.profilePicture;

    if (file) {
      const uploadPhoto = await cloudinary.uploader.upload(file, { resource_type: "auto" });
      photoUrl = uploadPhoto.secure_url;
    }

    const updatedData = { firstName, lastName, profilePicture: photoUrl };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

  
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};

const getallusers=async(req,res)=>{
  try {
    const users=await User.find({}).select('firstName  lastName  enrolledCourses')

    if(!users) {
      return res.status(401).json("users not found")
    }

    return res.status(201).json({message:"users " ,data:users})
  } catch (error) {
    console.log(error)
    return res.status(400).json({message:"users not found"})
  }
}

const updateUserbyId=async(req,res)=>{
  const { id } = req.params;
    const { firstName, lastName } = req.body;
    
    try {
      const updateProfile=await User.findByIdAndUpdate(id,{
        firstName,
        lastName,
      },
      { new: true }
    );

      if(!updateProfile) {
          return res.status(401).json({message:"profile not updated"})
      }

      await updateProfile.save()

      return res.status(200).json({message:"profile updated successfully",data:updateProfile})

    } catch (error) {
       console.log(error)
       
      return res.status(200).json({message:"profile updated failed"})
    }
}

const getuserbyid=async(req, res) => {
   
  try {
    const { id } = req.params;

    const user=await User.findById(id).select('firstName  lastName  role enrolledCourses')

    if(!user) {
      return res.status(401).json({message:"user not found"})
    }
    return res.status(200).json({message:"profile updated successfully",data:user})
    
  } catch (error) {
    console.log(error)
       
    return res.status(200).json({message:"user getting error duirng getting"})
  }
}

const deleteUser=async(req, res) => {
     
  try {
    const { id } = req.params;

    const user=await User.findByIdAndDelete(id)
    
    if(!user) {
      return res.status(401).json({message:"user not found"})
    }
      await user.save()
    return res.status(200).json({message:"user deleted successfully"})

  } catch (error) {
    console.log(error)
       
    return res.status(200).json({message:"user getting error duirng getting"})
  }
  

}







module.exports = { registerUser, loginUser,logoutUser,viewProfile,updateProfile,getallusers ,updateUserbyId,getuserbyid,deleteUser};
