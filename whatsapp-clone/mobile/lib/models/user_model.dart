class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String avatar;
  final String status;
  final bool isOnline;
  final DateTime lastSeen;
  final List<Contact> contacts;
  final List<String> blockedUsers;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatar = '',
    this.status = 'Hey there! I am using WhatsApp Clone',
    this.isOnline = false,
    required this.lastSeen,
    this.contacts = const [],
    this.blockedUsers = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatar: json['avatar'] ?? '',
      status: json['status'] ?? 'Hey there! I am using WhatsApp Clone',
      isOnline: json['isOnline'] ?? false,
      lastSeen: DateTime.parse(json['lastSeen'] ?? DateTime.now().toIso8601String()),
      contacts: (json['contacts'] as List<dynamic>?)
          ?.map((contact) => Contact.fromJson(contact))
          .toList() ?? [],
      blockedUsers: List<String>.from(json['blockedUsers'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'status': status,
      'isOnline': isOnline,
      'lastSeen': lastSeen.toIso8601String(),
      'contacts': contacts.map((contact) => contact.toJson()).toList(),
      'blockedUsers': blockedUsers,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? status,
    bool? isOnline,
    DateTime? lastSeen,
    List<Contact>? contacts,
    List<String>? blockedUsers,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      status: status ?? this.status,
      isOnline: isOnline ?? this.isOnline,
      lastSeen: lastSeen ?? this.lastSeen,
      contacts: contacts ?? this.contacts,
      blockedUsers: blockedUsers ?? this.blockedUsers,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class Contact {
  final User user;
  final String name;
  final DateTime addedAt;

  Contact({
    required this.user,
    required this.name,
    required this.addedAt,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      user: User.fromJson(json['user']),
      name: json['name'] ?? '',
      addedAt: DateTime.parse(json['addedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'name': name,
      'addedAt': addedAt.toIso8601String(),
    };
  }
}