import 'user_model.dart';

enum MessageType { text, image, video, audio, document, system }
enum MessageStatus { sent, delivered, read }

class Message {
  final String id;
  final String chatId;
  final User sender;
  final MessageContent content;
  final MessageType messageType;
  final String? replyToId;
  final Message? replyTo;
  final bool forwarded;
  final MessageEdit edited;
  final MessageStatus status;
  final List<ReadReceipt> readBy;
  final List<DeliveryReceipt> deliveredTo;
  final List<Reaction> reactions;
  final List<String> deletedFor;
  final DateTime? expiresAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Message({
    required this.id,
    required this.chatId,
    required this.sender,
    required this.content,
    this.messageType = MessageType.text,
    this.replyToId,
    this.replyTo,
    this.forwarded = false,
    required this.edited,
    this.status = MessageStatus.sent,
    this.readBy = const [],
    this.deliveredTo = const [],
    this.reactions = const [],
    this.deletedFor = const [],
    this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['_id'] ?? json['id'] ?? '',
      chatId: json['chat'] ?? '',
      sender: User.fromJson(json['sender']),
      content: MessageContent.fromJson(json['content'] ?? {}),
      messageType: _parseMessageType(json['messageType']),
      replyToId: json['replyTo'],
      replyTo: json['replyTo'] != null && json['replyTo'] is Map 
          ? Message.fromJson(json['replyTo']) 
          : null,
      forwarded: json['forwarded'] ?? false,
      edited: MessageEdit.fromJson(json['edited'] ?? {}),
      status: _parseMessageStatus(json['status']),
      readBy: (json['readBy'] as List<dynamic>?)
          ?.map((item) => ReadReceipt.fromJson(item))
          .toList() ?? [],
      deliveredTo: (json['deliveredTo'] as List<dynamic>?)
          ?.map((item) => DeliveryReceipt.fromJson(item))
          .toList() ?? [],
      reactions: (json['reactions'] as List<dynamic>?)
          ?.map((item) => Reaction.fromJson(item))
          .toList() ?? [],
      deletedFor: List<String>.from(json['deletedFor'] ?? []),
      expiresAt: json['expiresAt'] != null 
          ? DateTime.parse(json['expiresAt']) 
          : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'chat': chatId,
      'sender': sender.toJson(),
      'content': content.toJson(),
      'messageType': messageType.name,
      'replyTo': replyToId,
      'forwarded': forwarded,
      'edited': edited.toJson(),
      'status': status.name,
      'readBy': readBy.map((item) => item.toJson()).toList(),
      'deliveredTo': deliveredTo.map((item) => item.toJson()).toList(),
      'reactions': reactions.map((item) => item.toJson()).toList(),
      'deletedFor': deletedFor,
      'expiresAt': expiresAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static MessageType _parseMessageType(String? type) {
    switch (type?.toLowerCase()) {
      case 'image':
        return MessageType.image;
      case 'video':
        return MessageType.video;
      case 'audio':
        return MessageType.audio;
      case 'document':
        return MessageType.document;
      case 'system':
        return MessageType.system;
      default:
        return MessageType.text;
    }
  }

  static MessageStatus _parseMessageStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      default:
        return MessageStatus.sent;
    }
  }

  Message copyWith({
    String? id,
    String? chatId,
    User? sender,
    MessageContent? content,
    MessageType? messageType,
    String? replyToId,
    Message? replyTo,
    bool? forwarded,
    MessageEdit? edited,
    MessageStatus? status,
    List<ReadReceipt>? readBy,
    List<DeliveryReceipt>? deliveredTo,
    List<Reaction>? reactions,
    List<String>? deletedFor,
    DateTime? expiresAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Message(
      id: id ?? this.id,
      chatId: chatId ?? this.chatId,
      sender: sender ?? this.sender,
      content: content ?? this.content,
      messageType: messageType ?? this.messageType,
      replyToId: replyToId ?? this.replyToId,
      replyTo: replyTo ?? this.replyTo,
      forwarded: forwarded ?? this.forwarded,
      edited: edited ?? this.edited,
      status: status ?? this.status,
      readBy: readBy ?? this.readBy,
      deliveredTo: deliveredTo ?? this.deliveredTo,
      reactions: reactions ?? this.reactions,
      deletedFor: deletedFor ?? this.deletedFor,
      expiresAt: expiresAt ?? this.expiresAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool isDeletedForUser(String userId) {
    return deletedFor.contains(userId);
  }

  bool isReadByUser(String userId) {
    return readBy.any((receipt) => receipt.user.id == userId);
  }

  bool isDeliveredToUser(String userId) {
    return deliveredTo.any((receipt) => receipt.user.id == userId);
  }
}

class MessageContent {
  final String? text;
  final MediaContent? media;

  MessageContent({
    this.text,
    this.media,
  });

  factory MessageContent.fromJson(Map<String, dynamic> json) {
    return MessageContent(
      text: json['text'],
      media: json['media'] != null ? MediaContent.fromJson(json['media']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'media': media?.toJson(),
    };
  }
}

class MediaContent {
  final String type;
  final String url;
  final String? filename;
  final int? size;
  final int? duration;

  MediaContent({
    required this.type,
    required this.url,
    this.filename,
    this.size,
    this.duration,
  });

  factory MediaContent.fromJson(Map<String, dynamic> json) {
    return MediaContent(
      type: json['type'] ?? '',
      url: json['url'] ?? '',
      filename: json['filename'],
      size: json['size'],
      duration: json['duration'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'url': url,
      'filename': filename,
      'size': size,
      'duration': duration,
    };
  }
}

class MessageEdit {
  final bool isEdited;
  final DateTime? editedAt;

  MessageEdit({
    this.isEdited = false,
    this.editedAt,
  });

  factory MessageEdit.fromJson(Map<String, dynamic> json) {
    return MessageEdit(
      isEdited: json['isEdited'] ?? false,
      editedAt: json['editedAt'] != null ? DateTime.parse(json['editedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'isEdited': isEdited,
      'editedAt': editedAt?.toIso8601String(),
    };
  }
}

class ReadReceipt {
  final User user;
  final DateTime readAt;

  ReadReceipt({
    required this.user,
    required this.readAt,
  });

  factory ReadReceipt.fromJson(Map<String, dynamic> json) {
    return ReadReceipt(
      user: User.fromJson(json['user']),
      readAt: DateTime.parse(json['readAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'readAt': readAt.toIso8601String(),
    };
  }
}

class DeliveryReceipt {
  final User user;
  final DateTime deliveredAt;

  DeliveryReceipt({
    required this.user,
    required this.deliveredAt,
  });

  factory DeliveryReceipt.fromJson(Map<String, dynamic> json) {
    return DeliveryReceipt(
      user: User.fromJson(json['user']),
      deliveredAt: DateTime.parse(json['deliveredAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'deliveredAt': deliveredAt.toIso8601String(),
    };
  }
}

class Reaction {
  final User user;
  final String emoji;
  final DateTime reactedAt;

  Reaction({
    required this.user,
    required this.emoji,
    required this.reactedAt,
  });

  factory Reaction.fromJson(Map<String, dynamic> json) {
    return Reaction(
      user: User.fromJson(json['user']),
      emoji: json['emoji'] ?? '',
      reactedAt: DateTime.parse(json['reactedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'emoji': emoji,
      'reactedAt': reactedAt.toIso8601String(),
    };
  }
}