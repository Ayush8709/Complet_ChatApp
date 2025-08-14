import { ConversationModel } from '../models/ConversationModel.js';

 const getConversation = async (currentUserId) => {
  try {
    if (!currentUserId) return [];


    const conversations = await ConversationModel.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('messages')
      .populate('sender')
      .populate('receiver');

    // 📦 Format each conversation
    const formattedConversations = conversations.map((conv) => {
      // 🧮 Count unseen messages
      const unseenCount = conv?.messages?.reduce((count, msg) => {
        const isMsgFromOther = msg?.msgByUserId?.toString() !== currentUserId;
        return count + (isMsgFromOther && !msg?.seen ? 1 : 0);
      }, 0);

      return {
        _id: conv?._id,
        sender: conv?.sender,
        receiver: conv?.receiver,
        unseenMsg: unseenCount,
        lastMsg: conv?.messages?.[conv.messages.length - 1] || null
      };
    });

    return formattedConversations;

  } catch (error) {
    console.error("Error in getConversation:", error);
    return [];
  }
};

export default getConversation;