import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js';
import UserModel from '../models/UserModel.js';
import { ConversationModel, MessageModel } from '../models/ConversationModel.js';
import getConversation from '../helpers/getConversation.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Get token and verify user
  const token = socket.handshake.auth.token;
  const user = await getUserDetailsFromToken(token);

  if (!user || !user._id) {
    console.error('Unauthorized user or missing _id, disconnecting:', user);
    socket.disconnect(true);
    return;
  }

  socket.join(user._id.toString());
  onlineUser.add(user._id.toString());

  // Broadcast online users
  io.emit('onlineUser', Array.from(onlineUser));

  // Handle message-page event
  socket.on('message-page', async (userId) => {
    console.log('message-page for userId:', userId);

    const userDetails = await UserModel.findById(userId).select('-password');
    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId),
    };
    socket.emit('message-user', payload);

    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: userId },
        { sender: userId, receiver: user._id },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    socket.emit('message', conversation?.messages || []);
  });

  // Handle new message event
  socket.on('new message', async (data) => {
    // Validate required fields
    if (!data.sender || !data.receiver) {
      console.error('Sender and receiver required for new message');
      return;
    }

    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    });

    if (!conversation) {
      conversation = await new ConversationModel({
        sender: data.sender,
        receiver: data.receiver,
      }).save();
    }

    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data.msgByUserId,
    });
    const savedMessage = await message.save();

    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $push: { messages: savedMessage._id } }
    );

    const updatedConversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    io.to(data.sender).emit('message', updatedConversation?.messages || []);
    io.to(data.receiver).emit('message', updatedConversation?.messages || []);

    const conversationSender = await getConversation(data.sender);
    const conversationReceiver = await getConversation(data.receiver);

    io.to(data.sender).emit('conversation', conversationSender);
    io.to(data.receiver).emit('conversation', conversationReceiver);
  });

  socket.on('sidebar', async (currentUserId) => {
    console.log('Fetching sidebar conversation for user:', currentUserId);
    const conversation = await getConversation(currentUserId);
    socket.emit('conversation', conversation);
  });

  socket.on('seen', async (msgByUserId) => {
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user._id },
      ],
    });

    const messageIds = conversation?.messages || [];

    await MessageModel.updateMany(
      { _id: { $in: messageIds }, msgByUserId },
      { $set: { seen: true } }
    );

    const conversationSender = await getConversation(user._id.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user._id.toString()).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });

  socket.on('disconnect', () => {
    onlineUser.delete(user._id.toString());
    console.log('User disconnected:', socket.id);
    io.emit('onlineUser', Array.from(onlineUser)); // Update clients on disconnect
  });
});

export { app, server };
