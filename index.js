const express=require('express');
const app=express();
const cookieParser=require('cookie-parser');
const connectDB=require('./src/utils/database');
const cors=require('cors');
require('dotenv').config()
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))


app.use(express.json());
app.use(cookieParser());



const userRouter=require('./src/routers/user.router');
const courseRouter=require('./src/routers/course.router');
const purchaseRouter=require('./src/routers/purchase.router');
const mockTestRouter=require('./src/routers/mocktest.router');
const questionRouter=require('./src/routers/question.router');
const progressRouter=require('./src/routers/progress.router');

app.use('/api/v1/users',userRouter);
app.use('/api/v1/courses',courseRouter);
app.use('/api/v1/payment',purchaseRouter);
app.use('/api/v1/mocktests',mockTestRouter);
app.use('/api/v1/questions',questionRouter);
app.use('/api/v1/progress',progressRouter);

connectDB().then(()=>{
  console.log("connected to db");
  app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`));
}).catch((error)=>console.log(error));
