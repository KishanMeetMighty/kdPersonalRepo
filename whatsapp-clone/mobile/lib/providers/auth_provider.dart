import 'package:flutter/foundation.dart';

import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isLoggedIn = false;

  AuthProvider(this._authService);

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _isLoggedIn;

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Register user
  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _authService.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );

      if (result['success']) {
        _user = result['user'];
        _isLoggedIn = true;
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(result['message']);
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Registration failed: ${e.toString()}');
      _setLoading(false);
      return false;
    }
  }

  // Login user
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _authService.login(
        email: email,
        password: password,
      );

      if (result['success']) {
        _user = result['user'];
        _isLoggedIn = true;
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(result['message']);
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Login failed: ${e.toString()}');
      _setLoading(false);
      return false;
    }
  }

  // Logout user
  Future<void> logout() async {
    _setLoading(true);

    try {
      await _authService.logout();
      _user = null;
      _isLoggedIn = false;
      _setError(null);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _user = null;
      _isLoggedIn = false;
      _setError(null);
      _setLoading(false);
      notifyListeners();
    }
  }

  // Get current user
  Future<void> getCurrentUser() async {
    _setLoading(true);

    try {
      final result = await _authService.getCurrentUser();

      if (result['success']) {
        _user = result['user'];
        _isLoggedIn = true;
      } else {
        _user = null;
        _isLoggedIn = false;
        _setError(result['message']);
      }
    } catch (e) {
      _user = null;
      _isLoggedIn = false;
      _setError('Failed to get user: ${e.toString()}');
    }

    _setLoading(false);
    notifyListeners();
  }

  // Check if user is logged in
  Future<void> checkAuthStatus() async {
    _setLoading(true);

    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        await getCurrentUser();
      } else {
        _user = null;
        _isLoggedIn = false;
        _setLoading(false);
        notifyListeners();
      }
    } catch (e) {
      _user = null;
      _isLoggedIn = false;
      _setLoading(false);
      notifyListeners();
    }
  }

  // Update user profile
  void updateUser(User updatedUser) {
    _user = updatedUser;
    notifyListeners();
  }

  // Update user online status
  void updateOnlineStatus(bool isOnline) {
    if (_user != null) {
      _user = _user!.copyWith(
        isOnline: isOnline,
        lastSeen: DateTime.now(),
      );
      notifyListeners();
    }
  }
}