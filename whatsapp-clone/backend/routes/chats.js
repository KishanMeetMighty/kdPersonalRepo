const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.findUserChats(req.user._id);
    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Create or get individual chat
router.post('/individual', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      'participants.user': { $all: [req.user._id, userId] }
    })
    .populate('participants.user', 'name avatar isOnline lastSeen')
    .populate('lastMessage');

    if (chat) {
      return res.json({ chat });
    }

    // Create new individual chat
    chat = new Chat({
      isGroupChat: false,
      participants: [
        { user: req.user._id },
        { user: userId }
      ]
    });

    await chat.save();
    await chat.populate('participants.user', 'name avatar isOnline lastSeen');

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create individual chat error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Create group chat
router.post('/group', auth, async (req, res) => {
  try {
    const { name, description, participantIds } = req.body;

    if (!name || !participantIds || participantIds.length < 2) {
      return res.status(400).json({
        message: 'Group name and at least 2 participants are required'
      });
    }

    // Verify all participants exist
    const participants = await User.find({ _id: { $in: participantIds } });
    if (participants.length !== participantIds.length) {
      return res.status(400).json({ message: 'Some participants not found' });
    }

    // Create group chat
    const chat = new Chat({
      name,
      isGroupChat: true,
      groupDescription: description,
      groupAdmin: req.user._id,
      participants: [
        { user: req.user._id, role: 'admin' },
        ...participantIds.map(id => ({ user: id, role: 'member' }))
      ]
    });

    await chat.save();
    await chat.populate('participants.user', 'name avatar isOnline lastSeen');
    await chat.populate('groupAdmin', 'name avatar');

    res.status(201).json({
      message: 'Group chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get chat by ID
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants.user', 'name avatar isOnline lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Update group chat
router.put('/:chatId', auth, async (req, res) => {
  try {
    const { name, description, groupAvatar } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Cannot update individual chat' });
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can update group' });
    }

    // Update fields
    if (name) chat.name = name;
    if (description) chat.groupDescription = description;
    if (groupAvatar) chat.groupAvatar = groupAvatar;

    await chat.save();
    await chat.populate('participants.user', 'name avatar isOnline lastSeen');
    await chat.populate('groupAdmin', 'name avatar');

    res.json({
      message: 'Group updated successfully',
      chat
    });
  } catch (error) {
    console.error('Update group chat error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Add participants to group
router.post('/:chatId/participants', auth, async (req, res) => {
  try {
    const { userIds } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Cannot add participants to individual chat' });
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add participants' });
    }

    // Add participants
    for (const userId of userIds) {
      await chat.addParticipant(userId);
    }

    await chat.populate('participants.user', 'name avatar isOnline lastSeen');

    res.json({
      message: 'Participants added successfully',
      chat
    });
  } catch (error) {
    console.error('Add participants error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove participant from group
router.delete('/:chatId/participants/:userId', auth, async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Cannot remove participants from individual chat' });
    }

    // Check if user is admin or removing themselves
    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isRemovingSelf = userId === req.user._id.toString();

    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await chat.removeParticipant(userId);
    await chat.populate('participants.user', 'name avatar isOnline lastSeen');

    res.json({
      message: 'Participant removed successfully',
      chat
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // For group chats, only admin can delete
    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can delete group' });
    }

    // For individual chats, any participant can delete
    if (!chat.isGroupChat) {
      const isParticipant = chat.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );
      if (!isParticipant) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: req.params.chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(req.params.chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;