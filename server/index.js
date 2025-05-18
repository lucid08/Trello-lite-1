import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoute from './routes/user.route.js';
import boardRoute from './routes/board.route.js';
import taskRoute from './routes/task.route.js';
import activityRoute from './routes/activity.route.js';
import listRoute from './routes/list.route.js';
import connectDB from './config/db.js';

dotenv.config({});

const app = express();

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true 
}));
const PORT = process.env.PORT || 5000;
app.use('/api/activities', activityRoute);
app.use("/api/v1/user",userRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/boards', boardRoute);
app.use('/api/lists', listRoute);
app.listen(PORT,() => { 
    connectDB();
    console.log(`listening on ${PORT}`);
});