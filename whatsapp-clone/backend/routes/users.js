const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (for search)
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const searchQuery = {
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };

    const users = await User.find(searchQuery)
      .select('name email phone avatar status isOnline lastSeen')
      .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone avatar status isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, status, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Add contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { userId, name } = req.body;

    // Check if user exists
    const contactUser = await User.findById(userId);
    if (!contactUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = req.user.contacts.find(
      contact => contact.user.toString() === userId
    );

    if (existingContact) {
      return res.status(400).json({ message: 'Contact already exists' });
    }

    // Add contact
    req.user.contacts.push({ user: userId, name });
    await req.user.save();

    res.json({
      message: 'Contact added successfully',
      contact: { user: contactUser, name }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user contacts
router.get('/contacts/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('contacts.user', 'name email phone avatar status isOnline lastSeen');

    res.json({ contacts: user.contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove contact
router.delete('/contacts/:contactId', auth, async (req, res) => {
  try {
    req.user.contacts = req.user.contacts.filter(
      contact => contact.user.toString() !== req.params.contactId
    );
    await req.user.save();

    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Block user
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.user.blockedUsers.includes(userId)) {
      req.user.blockedUsers.push(userId);
      await req.user.save();
    }

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Unblock user
router.delete('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    req.user.blockedUsers = req.user.blockedUsers.filter(
      blockedId => blockedId.toString() !== userId
    );
    await req.user.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;