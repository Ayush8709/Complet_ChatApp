// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDb from './config/db.js';
import routes from './routes/index.js';
import { app as socketApp, server as socketServer } from './socket/index.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDb();

socketApp.use(cookieParser());


socketApp.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

socketApp.use(express.json());


// Test route
socketApp.get('/', (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

socketApp.use('/api', routes);

socketServer.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO at ${PORT}`);
});
