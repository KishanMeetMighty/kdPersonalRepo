import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';

import 'constants/app_colors.dart';
import 'providers/auth_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/socket_provider.dart';
import 'screens/auth/splash_screen.dart';
import 'services/auth_service.dart';
import 'services/chat_service.dart';
import 'services/socket_service.dart';
import 'utils/app_routes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  await Hive.initFlutter();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(375, 812),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider(AuthService())),
            ChangeNotifierProvider(create: (_) => ChatProvider(ChatService())),
            ChangeNotifierProvider(create: (_) => SocketProvider(SocketService())),
          ],
          child: GetMaterialApp(
            title: 'WhatsApp Clone',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              primarySwatch: Colors.green,
              primaryColor: AppColors.primary,
              scaffoldBackgroundColor: AppColors.background,
              appBarTheme: const AppBarTheme(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 1,
              ),
              fontFamily: 'Roboto',
              useMaterial3: true,
            ),
            darkTheme: ThemeData.dark().copyWith(
              primaryColor: AppColors.primary,
              scaffoldBackgroundColor: AppColors.darkBackground,
              appBarTheme: const AppBarTheme(
                backgroundColor: AppColors.darkSurface,
                foregroundColor: Colors.white,
                elevation: 1,
              ),
            ),
            home: const SplashScreen(),
            getPages: AppRoutes.routes,
          ),
        );
      },
    );
  }
}