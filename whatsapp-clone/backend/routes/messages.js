const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages
    const messages = await Message.getChatMessages(chatId, parseInt(page), parseInt(limit));

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, content, messageType = 'text', replyTo } = req.body;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const messageData = {
      chat: chatId,
      sender: req.user._id,
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

    // Populate message for response
    await message.populate('sender', 'name avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Update message (edit)
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    // Update message content
    if (message.messageType === 'text') {
      message.content.text = content.text;
    }

    message.edited.isEdited = true;
    message.edited.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'name avatar');

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    if (deleteForEveryone) {
      // Delete for everyone (within 1 hour of sending)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (message.createdAt < oneHourAgo) {
        return res.status(400).json({ 
          message: 'Can only delete for everyone within 1 hour of sending' 
        });
      }

      await Message.findByIdAndDelete(messageId);
      res.json({ message: 'Message deleted for everyone' });
    } else {
      // Delete for me only
      await message.deleteForUser(req.user._id);
      res.json({ message: 'Message deleted for you' });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead(req.user._id);

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Add reaction to message
router.post('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user._id, emoji);
    await message.populate('reactions.user', 'name');

    res.json({
      message: 'Reaction added successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove reaction from message
router.delete('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user._id);
    await message.populate('reactions.user', 'name');

    res.json({
      message: 'Reaction removed successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Forward message
router.post('/:messageId/forward', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { chatIds } = req.body;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const forwardedMessages = [];

    for (const chatId of chatIds) {
      // Check if chat exists and user is participant
      const chat = await Chat.findById(chatId);
      if (!chat) continue;

      const isParticipant = chat.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!isParticipant) continue;

      // Create forwarded message
      const forwardedMessage = new Message({
        chat: chatId,
        sender: req.user._id,
        content: originalMessage.content,
        messageType: originalMessage.messageType,
        forwarded: true
      });

      await forwardedMessage.save();
      
      // Update chat's last message and activity
      chat.lastMessage = forwardedMessage._id;
      chat.lastActivity = new Date();
      await chat.save();

      forwardedMessages.push(forwardedMessage);
    }

    res.json({
      message: 'Message forwarded successfully',
      forwardedCount: forwardedMessages.length
    });
  } catch (error) {
    console.error('Forward message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;