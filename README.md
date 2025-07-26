# PasteKeeper

A modern, cross-platform clipboard manager built with React Native and Expo. PasteKeeper helps yo## ⚙️ Configuration Options

Configure the app's behavior in the Settings screen:

- ⏱️ Monitoring interval (1s - 30s)
- 🔄 Background monitoring settings
- 🚀 Auto-start preferences
- 🎨 Theme customization
  - Light/Dark mode
  - Custom colors
  - Font sizes
- 💾 Storage management
  - Maximum history size
  - Auto-cleanup rules
  - Backup settings

## 🔧 Troubleshooting

Common issues and solutions:

### Clipboard Monitoring Issues

1. **Permissions**
   - Ensure clipboard permissions are granted in app settings
   - Check notification permissions for background monitoring

2. **Platform-Specific**
   - Android: Disable battery optimization for reliable background operation
   - iOS: Background execution has system limitations
   - Web: Page must have focus for clipboard access

3. **Performance**
   - Clear history if app becomes slow
   - Adjust monitoring interval
   - Check storage usage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

[MIT License](LICENSE) - feel free to use this project for your own learning and development.ble history of your clipboard contents, including text, URLs, code snippets, and images, making it easier to manage and reuse copied content across your devices.

## ✨ Features

- 📋 Real-time clipboard monitoring in foreground and background
- 📝 Support for multiple content types:
  - Plain text
  - Rich text
  - URLs with preview
  - Code snippets with syntax highlighting
  - Images with thumbnails
- 🏷️ Smart content categorization and tagging
- ⭐ Favorites system for quick access
- 🔄 Intuitive swipe actions for quick operations
- 🌓 Dark mode and theme customization
- 🔍 Full-text search with filters
- 📱 Cross-platform support (iOS, Android, Web)
- 🔒 Privacy-focused with local storage
- ⚡ Performance optimized for large histories

## 🖼️ Image Clipboard Support

### Current Implementation

The current implementation has some limitations regarding image clipboard support:

- **Web**: Uses the Web Clipboard API to detect and handle images
- **Android**: Basic support for detecting image paths and content URIs
- **iOS**: Limited support through the Expo Clipboard API

### Recommended Enhancements

For better image clipboard support, especially on Android and iOS, consider implementing one of the following:

1. **Use a Native Module**: Implement a custom native module that can access the platform-specific clipboard APIs directly:
   - For Android: Use `android.content.ClipboardManager` to access all clipboard content types
   - For iOS: Use `UIPasteboard` to access image data

2. **Use Existing Packages**:
   - [expo-clipboard-plus](https://github.com/expo/expo/tree/main/packages/expo-clipboard) (when available)
   - [react-native-clipboard](https://github.com/react-native-clipboard/clipboard)
   - [react-native-community/clipboard](https://github.com/react-native-clipboard/clipboard)

3. **Develop with Expo Dev Client**: Use Expo Dev Client to include custom native modules while still leveraging Expo's ecosystem

## Background Monitoring

For optimal background monitoring on Android:

1. Consider implementing a foreground service for continuous clipboard monitoring
2. Use `BackgroundFetch` API for periodic checks
3. Implement a work manager for scheduled clipboard checks

## 🚀 Getting Started

### Prerequisites

- Node.js 14 or newer
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For mobile development:
  - iOS: Xcode (Mac only)
  - Android: Android Studio and SDK

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pastekeeper.git
   cd pastekeeper
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the sample environment file:
   ```bash
   cp sample.env .env
   ```

4. Configure your environment variables in `.env`

### Running the App

```bash
# Start the development server
npm start
# or
yarn start

# Run on iOS
npm run ios
# or
yarn ios

# Run on Android
npm run android
# or
yarn android

# Run on web
npm run web
# or
yarn web
```

## ⚙️ Configuration

You can configure the app's behavior in the Settings screen:

- Monitoring interval
- Background monitoring
- Auto-start monitoring
- Theme preferences
- Storage limits

## Troubleshooting

If you encounter issues with clipboard monitoring:

1. Ensure clipboard permissions are granted
2. On Android, check if battery optimization is disabled for the app
3. On iOS, be aware of background execution limitations
4. On web, ensure the page has focus and clipboard permissions

## License

[MIT License](LICENSE)
