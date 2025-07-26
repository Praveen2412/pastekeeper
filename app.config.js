module.exports = {
  name: "PasteKeeper",
  slug: "pastekeeper",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    },
    package: "com.pastekeeper.app"
  },
  plugins: [
    "expo-router"
  ],
  scheme: "pastekeeper",
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: "c641917b-1f41-4b41-93ad-373f25b19ef3"
    }
  }
}; 