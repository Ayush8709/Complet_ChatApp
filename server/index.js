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

// Apply middleware before routes and sockets
socketApp.use(cookieParser());
socketApp.use(cors({
  origin: process.env.FRONTEND_URL,  // Must match exactly frontend origin (e.g. 'https://complet-chat-app.vercel.app')
  credentials: true,
}));

socketApp.use(express.json());

// Test route
socketApp.get('/', (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

// API routes
socketApp.use('/api', routes);

// Start HTTP + Socket.IO server
socketServer.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO at port ${PORT}`);
});
