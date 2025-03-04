const jwt=require('jsonwebtoken');
const User=require('../models/user.model');
const authorizeRole = (allowedRoles) => async(req, res, next) => {
    
  const token=req.cookies.token;

    
  if(!token){
      return res.status(401).json({error:"token is not found"});
  }
try {
  const decodedtoken= jwt.verify(token,process.env.JWT_SECRET_KEY);
  
 const user=await User.findById(decodedtoken.userId);  

  if(!user){
    return res.status(401).json({error:"user not found"});
  }

  if(!allowedRoles.includes(user.role)){
    return res.status(401).json({error:"user not authorized"});
  }

  req.user=user;
  next();

} catch (error) {
    console.log(error);
    return res.status(500).json({error:"server error"});
}
   

}

module.exports=authorizeRole;