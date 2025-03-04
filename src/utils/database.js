const mongooose=require('mongoose');


const connectDB=async()=>{
  try {
    await mongooose.connect(process.env.DB_NAME);
  } catch (error) {
    console.log(error)
  }
}

module.exports=connectDB