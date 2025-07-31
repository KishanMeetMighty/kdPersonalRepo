const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      trim: true
    },
    media: {
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document']
      },
      url: String,
      filename: String,
      size: Number,
      duration: Number // for audio/video
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'system'],
    default: 'text'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  forwarded: {
    type: Boolean,
    default: false
  },
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if message is deleted for user
messageSchema.virtual('isDeletedForUser').get(function() {
  return function(userId) {
    return this.deletedFor.includes(userId);
  };
});

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId });
    this.status = 'read';
  }
  return this.save();
};

// Method to mark as delivered to user
messageSchema.methods.markAsDelivered = function(userId) {
  const existingDelivered = this.deliveredTo.find(d => d.user.toString() === userId.toString());
  if (!existingDelivered) {
    this.deliveredTo.push({ user: userId });
    if (this.status === 'sent') {
      this.status = 'delivered';
    }
  }
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => r.user.toString() === userId.toString());
  if (existingReaction) {
    existingReaction.emoji = emoji;
    existingReaction.reactedAt = new Date();
  } else {
    this.reactions.push({ user: userId, emoji });
  }
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to delete for user
messageSchema.methods.deleteForUser = function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
  }
  return this.save();
};

// Static method to get chat messages
messageSchema.statics.getChatMessages = function(chatId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .populate('replyTo', 'content sender')
    .populate('readBy.user', 'name')
    .populate('deliveredTo.user', 'name')
    .populate('reactions.user', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Message', messageSchema);