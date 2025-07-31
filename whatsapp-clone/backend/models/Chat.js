const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupDescription: {
    type: String,
    maxlength: [500, 'Group description cannot be more than 500 characters']
  },
  groupAvatar: {
    type: String,
    default: ''
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  settings: {
    onlyAdminsCanMessage: {
      type: Boolean,
      default: false
    },
    disappearingMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 604800000 // 7 days in milliseconds
      }
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ isGroupChat: 1 });

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({ user: userId, role });
  }
  return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Method to update last activity
chatSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find chats for a user
chatSchema.statics.findUserChats = function(userId) {
  return this.find({
    'participants.user': userId
  })
  .populate('participants.user', 'name avatar isOnline lastSeen')
  .populate('lastMessage')
  .populate('groupAdmin', 'name avatar')
  .sort({ lastActivity: -1 });
};

module.exports = mongoose.model('Chat', chatSchema);