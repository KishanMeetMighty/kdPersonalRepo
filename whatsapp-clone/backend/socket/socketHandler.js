const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(socket.userId);

    // Join user to all their chat rooms
    try {
      const userChats = await Chat.find({
        'participants.user': socket.userId
      });

      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });

      // Notify contacts that user is online
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        isOnline: true,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error joining chat rooms:', error);
    }

    // Handle joining a chat room
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          p => p.user.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(chatId);
        socket.emit('joined_chat', { chatId });
      } catch (error) {
        socket.emit('error', { message: 'Error joining chat' });
      }
    });

    // Handle leaving a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      socket.emit('left_chat', { chatId });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', replyTo } = data;

        // Verify chat and user participation
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          p => p.user.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create message
        const messageData = {
          chat: chatId,
          sender: socket.userId,
          messageType,
          content: {}
        };

        if (messageType === 'text') {
          messageData.content.text = content.text;
        } else {
          messageData.content.media = content.media;
        }

        if (replyTo) {
          messageData.replyTo = replyTo;
        }

        const message = new Message(messageData);
        await message.save();

        // Update chat's last message and activity
        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Populate message for broadcast
        await message.populate('sender', 'name avatar');
        if (replyTo) {
          await message.populate('replyTo', 'content sender');
        }

        // Broadcast message to all participants
        io.to(chatId).emit('new_message', message);

        // Mark message as delivered for online participants
        const onlineParticipants = await User.find({
          _id: { $in: chat.participants.map(p => p.user) },
          isOnline: true,
          _id: { $ne: socket.userId }
        });

        for (const participant of onlineParticipants) {
          await message.markAsDelivered(participant._id);
        }

        // Send delivery confirmations
        socket.emit('message_sent', {
          tempId: data.tempId,
          message
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle message read receipts
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);
        
        if (message) {
          await message.markAsRead(socket.userId);
          
          // Notify sender about read receipt
          socket.to(message.sender.toString()).emit('message_read', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_stop_typing', {
        userId: socket.userId,
        chatId
      });
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);
        
        if (message) {
          await message.addReaction(socket.userId, emoji);
          await message.populate('reactions.user', 'name');
          
          // Broadcast reaction to chat participants
          io.to(message.chat.toString()).emit('reaction_added', {
            messageId,
            reactions: message.reactions
          });
        }
      } catch (error) {
        console.error('Add reaction error:', error);
      }
    });

    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);
        
        if (message) {
          await message.removeReaction(socket.userId);
          await message.populate('reactions.user', 'name');
          
          // Broadcast reaction removal to chat participants
          io.to(message.chat.toString()).emit('reaction_removed', {
            messageId,
            reactions: message.reactions
          });
        }
      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    });

    // Handle user status updates
    socket.on('update_status', async (data) => {
      try {
        const { status } = data;
        await User.findByIdAndUpdate(socket.userId, { status });
        
        // Notify contacts about status update
        socket.broadcast.emit('user_status_updated', {
          userId: socket.userId,
          status
        });
      } catch (error) {
        console.error('Update status error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify contacts that user is offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;