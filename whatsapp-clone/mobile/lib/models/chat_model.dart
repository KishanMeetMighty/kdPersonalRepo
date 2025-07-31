import 'user_model.dart';
import 'message_model.dart';

class Chat {
  final String id;
  final String? name;
  final bool isGroupChat;
  final List<Participant> participants;
  final User? groupAdmin;
  final String? groupDescription;
  final String? groupAvatar;
  final Message? lastMessage;
  final DateTime lastActivity;
  final ChatSettings settings;
  final DateTime createdAt;
  final DateTime updatedAt;

  Chat({
    required this.id,
    this.name,
    this.isGroupChat = false,
    this.participants = const [],
    this.groupAdmin,
    this.groupDescription,
    this.groupAvatar,
    this.lastMessage,
    required this.lastActivity,
    required this.settings,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'],
      isGroupChat: json['isGroupChat'] ?? false,
      participants: (json['participants'] as List<dynamic>?)
          ?.map((participant) => Participant.fromJson(participant))
          .toList() ?? [],
      groupAdmin: json['groupAdmin'] != null ? User.fromJson(json['groupAdmin']) : null,
      groupDescription: json['groupDescription'],
      groupAvatar: json['groupAvatar'],
      lastMessage: json['lastMessage'] != null ? Message.fromJson(json['lastMessage']) : null,
      lastActivity: DateTime.parse(json['lastActivity'] ?? DateTime.now().toIso8601String()),
      settings: ChatSettings.fromJson(json['settings'] ?? {}),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isGroupChat': isGroupChat,
      'participants': participants.map((p) => p.toJson()).toList(),
      'groupAdmin': groupAdmin?.toJson(),
      'groupDescription': groupDescription,
      'groupAvatar': groupAvatar,
      'lastMessage': lastMessage?.toJson(),
      'lastActivity': lastActivity.toIso8601String(),
      'settings': settings.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Chat copyWith({
    String? id,
    String? name,
    bool? isGroupChat,
    List<Participant>? participants,
    User? groupAdmin,
    String? groupDescription,
    String? groupAvatar,
    Message? lastMessage,
    DateTime? lastActivity,
    ChatSettings? settings,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Chat(
      id: id ?? this.id,
      name: name ?? this.name,
      isGroupChat: isGroupChat ?? this.isGroupChat,
      participants: participants ?? this.participants,
      groupAdmin: groupAdmin ?? this.groupAdmin,
      groupDescription: groupDescription ?? this.groupDescription,
      groupAvatar: groupAvatar ?? this.groupAvatar,
      lastMessage: lastMessage ?? this.lastMessage,
      lastActivity: lastActivity ?? this.lastActivity,
      settings: settings ?? this.settings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Get other participant in individual chat
  User? getOtherParticipant(String currentUserId) {
    if (isGroupChat) return null;
    
    final otherParticipant = participants.firstWhere(
      (p) => p.user.id != currentUserId,
      orElse: () => participants.first,
    );
    
    return otherParticipant.user;
  }

  // Get chat display name
  String getDisplayName(String currentUserId) {
    if (isGroupChat) {
      return name ?? 'Group Chat';
    } else {
      final otherUser = getOtherParticipant(currentUserId);
      return otherUser?.name ?? 'Unknown User';
    }
  }

  // Get chat display avatar
  String getDisplayAvatar(String currentUserId) {
    if (isGroupChat) {
      return groupAvatar ?? '';
    } else {
      final otherUser = getOtherParticipant(currentUserId);
      return otherUser?.avatar ?? '';
    }
  }
}

class Participant {
  final User user;
  final String role;
  final DateTime joinedAt;

  Participant({
    required this.user,
    this.role = 'member',
    required this.joinedAt,
  });

  factory Participant.fromJson(Map<String, dynamic> json) {
    return Participant(
      user: User.fromJson(json['user']),
      role: json['role'] ?? 'member',
      joinedAt: DateTime.parse(json['joinedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'role': role,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }
}

class ChatSettings {
  final bool onlyAdminsCanMessage;
  final DisappearingMessages disappearingMessages;

  ChatSettings({
    this.onlyAdminsCanMessage = false,
    required this.disappearingMessages,
  });

  factory ChatSettings.fromJson(Map<String, dynamic> json) {
    return ChatSettings(
      onlyAdminsCanMessage: json['onlyAdminsCanMessage'] ?? false,
      disappearingMessages: DisappearingMessages.fromJson(json['disappearingMessages'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'onlyAdminsCanMessage': onlyAdminsCanMessage,
      'disappearingMessages': disappearingMessages.toJson(),
    };
  }
}

class DisappearingMessages {
  final bool enabled;
  final int duration; // in milliseconds

  DisappearingMessages({
    this.enabled = false,
    this.duration = 604800000, // 7 days
  });

  factory DisappearingMessages.fromJson(Map<String, dynamic> json) {
    return DisappearingMessages(
      enabled: json['enabled'] ?? false,
      duration: json['duration'] ?? 604800000,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'duration': duration,
    };
  }
}