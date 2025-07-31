# WhatsApp Clone

A full-stack WhatsApp clone built with Node.js backend and Flutter mobile app, featuring real-time messaging, user authentication, and modern UI design.

## 🚀 Features

### Backend Features
- **User Authentication** - JWT-based registration and login
- **Real-time Messaging** - Socket.io for instant message delivery
- **Chat Management** - Individual and group chats
- **Message Features** - Text messages, media support, message status (sent/delivered/read)
- **User Management** - Online status, last seen, user profiles
- **Message Reactions** - Emoji reactions to messages
- **Message Actions** - Edit, delete, forward, reply to messages
- **Group Features** - Create groups, add/remove participants, admin controls
- **Security** - Rate limiting, input validation, secure authentication

### Mobile App Features
- **Modern UI** - WhatsApp-like interface with dark/light theme support
- **Authentication** - Login and registration screens
- **Chat Interface** - Real-time messaging with typing indicators
- **Media Support** - Image, video, audio, and document sharing
- **Push Notifications** - Real-time message notifications
- **Offline Support** - Local storage with Hive
- **Responsive Design** - Optimized for different screen sizes

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Cloudinary** - Media file storage
- **Multer** - File upload handling

### Mobile App
- **Flutter** - Cross-platform mobile framework
- **Provider** - State management
- **GetX** - Navigation and utilities
- **Socket.io Client** - Real-time communication
- **Hive** - Local database
- **HTTP/Dio** - API communication
- **Cached Network Image** - Image caching
- **Permission Handler** - Device permissions

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Flutter** (v3.10.0 or higher)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whatsapp-clone
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=development
```

#### Database Setup
1. **Local MongoDB**: Make sure MongoDB is running on your system
2. **MongoDB Atlas**: Replace the MONGODB_URI with your Atlas connection string

#### Start the Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:3000`

### 3. Mobile App Setup

#### Install Dependencies
```bash
cd mobile
flutter pub get
```

#### Configure API Endpoint
Update the API base URL in `lib/services/auth_service.dart`:

```dart
static const String baseUrl = 'http://YOUR_IP_ADDRESS:3000/api';
```

**Note**: Replace `YOUR_IP_ADDRESS` with your computer's IP address for testing on physical devices.

#### Run the Mobile App

##### For Android:
```bash
flutter run
```

##### For iOS (macOS only):
```bash
flutter run -d ios
```

##### For Web:
```bash
flutter run -d web
```

## 📱 Mobile App Development

### Running on Physical Device

1. **Enable Developer Options** on your Android device
2. **Enable USB Debugging**
3. Connect your device via USB
4. Run `flutter devices` to verify connection
5. Run `flutter run` to install the app

### Building APK

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Split APKs by architecture
flutter build apk --split-per-abi
```

APK files will be generated in `build/app/outputs/flutter-apk/`

## 🗄️ Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  avatar: String,
  status: String,
  isOnline: Boolean,
  lastSeen: Date,
  contacts: [{ user: ObjectId, name: String, addedAt: Date }],
  blockedUsers: [ObjectId]
}
```

### Chat Collection
```javascript
{
  name: String,
  isGroupChat: Boolean,
  participants: [{ user: ObjectId, role: String, joinedAt: Date }],
  groupAdmin: ObjectId,
  groupDescription: String,
  groupAvatar: String,
  lastMessage: ObjectId,
  lastActivity: Date,
  settings: {
    onlyAdminsCanMessage: Boolean,
    disappearingMessages: { enabled: Boolean, duration: Number }
  }
}
```

### Message Collection
```javascript
{
  chat: ObjectId,
  sender: ObjectId,
  content: {
    text: String,
    media: { type: String, url: String, filename: String, size: Number }
  },
  messageType: String,
  replyTo: ObjectId,
  forwarded: Boolean,
  edited: { isEdited: Boolean, editedAt: Date },
  status: String,
  readBy: [{ user: ObjectId, readAt: Date }],
  deliveredTo: [{ user: ObjectId, deliveredAt: Date }],
  reactions: [{ user: ObjectId, emoji: String, reactedAt: Date }],
  deletedFor: [ObjectId],
  expiresAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/contacts` - Add contact
- `GET /api/users/contacts/list` - Get contacts
- `DELETE /api/users/contacts/:contactId` - Remove contact

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats/individual` - Create individual chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/:chatId` - Get chat details
- `PUT /api/chats/:chatId` - Update group chat
- `POST /api/chats/:chatId/participants` - Add participants
- `DELETE /api/chats/:chatId/participants/:userId` - Remove participant

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message
- `PUT /api/messages/:messageId/read` - Mark as read
- `POST /api/messages/:messageId/reactions` - Add reaction
- `POST /api/messages/:messageId/forward` - Forward message

## 🔄 Socket.io Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `mark_as_read` - Mark message as read
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `add_reaction` - Add emoji reaction
- `remove_reaction` - Remove emoji reaction

### Server to Client
- `new_message` - New message received
- `message_sent` - Message delivery confirmation
- `message_read` - Message read receipt
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `reaction_added` - Reaction added to message
- `reaction_removed` - Reaction removed from message

## 🔧 Configuration

### Backend Configuration
- **Port**: Default 3000, configurable via PORT environment variable
- **Database**: MongoDB connection string in MONGODB_URI
- **JWT**: Secret key and expiration time configurable
- **File Upload**: Cloudinary for media file storage
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Mobile App Configuration
- **API Base URL**: Update in services for your server IP
- **Theme**: Supports light and dark themes
- **Offline Storage**: Hive for local data persistence
- **Image Caching**: Automatic image caching for better performance

## 🚀 Deployment

### Backend Deployment (Heroku Example)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git subtree push --prefix backend heroku main
```

### Mobile App Deployment
1. **Google Play Store**: Follow Flutter's [deployment guide](https://docs.flutter.dev/deployment/android)
2. **Apple App Store**: Follow Flutter's [iOS deployment guide](https://docs.flutter.dev/deployment/ios)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile App Testing
```bash
cd mobile
flutter test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
- **Port Already in Use**: Change PORT in .env file
- **CORS Issues**: Check CORS configuration in server.js

### Common Mobile App Issues
- **API Connection**: Verify backend is running and API URL is correct
- **Build Errors**: Run `flutter clean` and `flutter pub get`
- **Android Build Issues**: Check Android SDK and build tools are installed
- **iOS Build Issues**: Ensure Xcode is properly set up (macOS only)

### Network Issues
- **Physical Device Testing**: Use your computer's IP address, not localhost
- **Firewall**: Ensure your firewall allows connections on the backend port
- **Network Permissions**: Add internet permission in Android manifest

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information

## 🎯 Future Enhancements

- [ ] Voice and video calling
- [ ] Message encryption
- [ ] Story/Status feature
- [ ] Location sharing
- [ ] Message backup and restore
- [ ] Multi-device support
- [ ] Advanced group management
- [ ] Message scheduling
- [ ] Custom themes
- [ ] Bot integration

---

**Happy Coding! 🚀**