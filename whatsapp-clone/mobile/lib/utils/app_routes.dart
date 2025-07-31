import 'package:get/get.dart';

import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/chat/group_info_screen.dart';
import '../screens/chat/new_chat_screen.dart';
import '../screens/chat/new_group_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String chat = '/chat';
  static const String newChat = '/new-chat';
  static const String newGroup = '/new-group';
  static const String groupInfo = '/group-info';
  static const String profile = '/profile';
  static const String settings = '/settings';

  static List<GetPage> routes = [
    GetPage(
      name: splash,
      page: () => const SplashScreen(),
    ),
    GetPage(
      name: login,
      page: () => const LoginScreen(),
    ),
    GetPage(
      name: register,
      page: () => const RegisterScreen(),
    ),
    GetPage(
      name: home,
      page: () => const HomeScreen(),
    ),
    GetPage(
      name: chat,
      page: () => const ChatScreen(),
    ),
    GetPage(
      name: newChat,
      page: () => const NewChatScreen(),
    ),
    GetPage(
      name: newGroup,
      page: () => const NewGroupScreen(),
    ),
    GetPage(
      name: groupInfo,
      page: () => const GroupInfoScreen(),
    ),
    GetPage(
      name: profile,
      page: () => const ProfileScreen(),
    ),
    GetPage(
      name: settings,
      page: () => const SettingsScreen(),
    ),
  ];
}