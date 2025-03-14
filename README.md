# PasteKeeper

A clipboard manager app that helps you keep track of your clipboard history, including text and images.

## Features

- Clipboard monitoring in foreground and background
- Support for text, URLs, code snippets, and images
- Categorization of clipboard content
- Favorites system
- Swipe actions for quick operations
- Dark mode support

## Image Clipboard Support

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

## Installation

```bash
npm install
# or
yarn install
```

## Running the App

```bash
npm start
# or
yarn start
```

Then follow the instructions to open the app on your device or emulator.

## Configuration

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
