import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import messageRouter from './routes/message.route.js';
import { db } from './db/db.js';

import { app, server } from './lib/socket.js';


if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

if(!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not defined");
}
if(!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY is not defined");
}
if(!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not defined");
}

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)

server.listen(3000, () => {
    console.log('Server is running on port 3000');
})
