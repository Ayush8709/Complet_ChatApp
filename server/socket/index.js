import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js';
import UserModel from '../models/UserModel.js';
import { ConversationModel, MessageModel } from '../models/ConversationModel.js';
import getConversation from '../helpers/getConversation.js';

const app = express();

/**
 * Create HTTP server and initialize Socket.IO server with CORS settings.
 * Socket.IO server will allow connections from FRONTEND_URL with credentials.
 */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ,
    credentials: true,
  },
});

/**
 * A Set to keep track of online users by their user IDs.
 */
const onlineUser = new Set();

/**
 * Handles Socket.IO connection event.
 * Listens to various events like 'message-page', 'new message', 'sidebar', 'seen', and 'disconnect'.
 */
io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Extract token from socket handshake and get user details
  const token = socket.handshake.auth.token;
  const user = await getUserDetailsFromToken(token);

  if (!user) {
    // If user not found, disconnect socket immediately
    socket.disconnect(true);
    return;
  }

  if (!user._id) {
    console.error('User object missing _id:', user);
    socket.disconnect(true);
    return;
  }

  // Join the socket to a room named by the user's ID for private messaging
  socket.join(user._id.toString());

  // Add user to online users set
  onlineUser.add(user._id.toString());

  // Emit updated online user list to all clients
  io.emit('onlineUser', Array.from(onlineUser));

  /**
   * Event: 'message-page'
   * Triggered when client requests to open message page with a particular user ID.
   * Fetches user details and conversation messages between the current user and requested user.
   * Emits 'message-user' with user details and 'message' with message history.
   */
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

  /**
   * Event: 'new message'
   * Handles sending a new message.
   * Checks if a conversation exists between sender and receiver; creates if not.
   * Saves the new message, updates conversation with message ID.
   * Emits updated messages and conversations to both sender and receiver.
   */
  socket.on('new message', async (data) => {
    // Find conversation between sender and receiver
    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await new ConversationModel({
        sender: data.sender,
        receiver: data.receiver,
      }).save();
    }

    // Create and save new message
    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data.msgByUserId,
    });
    const savedMessage = await message.save();

    // Push message ID to conversation's messages array
    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $push: { messages: savedMessage._id } }
    );

    // Fetch updated conversation messages
    const updatedConversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    // Emit updated messages to sender and receiver rooms
    io.to(data.sender).emit('message', updatedConversation?.messages || []);
    io.to(data.receiver).emit('message', updatedConversation?.messages || []);

    // Fetch updated conversation lists for sender and receiver
    const conversationSender = await getConversation(data.sender);
    const conversationReceiver = await getConversation(data.receiver);

    // Emit updated conversation lists
    io.to(data.sender).emit('conversation', conversationSender);
    io.to(data.receiver).emit('conversation', conversationReceiver);
  });

  /**
   * Event: 'sidebar'
   * Sends the conversation list for the current user to update their sidebar.
   */
  socket.on('sidebar', async (currentUserId) => {
    console.log('Fetching sidebar conversation for user:', currentUserId);

    const conversation = await getConversation(currentUserId);
    socket.emit('conversation', conversation);
  });

  /**
   * Event: 'seen'
   * Marks messages as seen from a particular user in the conversation.
   * Updates the 'seen' status for all relevant messages and emits updated conversation.
   */
  socket.on('seen', async (msgByUserId) => {
    // Find conversation between current user and message sender
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user._id },
      ],
    });

    const messageIds = conversation?.messages || [];

    // Update all messages by msgByUserId in this conversation as seen
    await MessageModel.updateMany(
      { _id: { $in: messageIds }, msgByUserId },
      { $set: { seen: true } }
    );

    // Fetch updated conversation lists for both users
    const conversationSender = await getConversation(user._id.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    // Emit updated conversation lists
    io.to(user._id.toString()).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });

  /**
   * Handles socket disconnection.
   * Removes the user from onlineUser set and logs disconnection.
   */
  socket.on('disconnect', () => {
    onlineUser.delete(user._id.toString());
    console.log('User disconnected:', socket.id);
  });
});

export { app, server };
