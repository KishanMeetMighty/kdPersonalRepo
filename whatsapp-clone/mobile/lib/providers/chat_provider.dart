import 'package:flutter/foundation.dart';

import '../services/chat_service.dart';

class ChatProvider extends ChangeNotifier {
  final ChatService _chatService;

  ChatProvider(this._chatService);

  // Chat provider implementation will be added here
  // This includes state management for:
  // - Chat list
  // - Current chat messages
  // - Message sending status
  // - Chat creation
}
