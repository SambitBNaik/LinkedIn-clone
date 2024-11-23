import express from 'express';
import dotenv from 'dotenv';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
 
import { connectDB } from './lib/db.js';
dotenv.config();
const app= express();

const PORT=process.env.PORT || 5000;

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/users",userRoutes);

app.listen(PORT,()=>{
    console.log(`Server is listining to port ${PORT}`);
    connectDB();
});