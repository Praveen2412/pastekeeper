// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add resolution for .android.js and .ios.js files
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'android.js',
  'ios.js',
];

// Increase timeout for slow connections
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Extend timeout for bundle requests
      if (req.url.includes('bundle')) {
        res.setTimeout(60000); // 60 seconds timeout
      }
      return middleware(req, res, next);
    };
  },
};

// Add support for Expo Router
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-router': path.resolve(__dirname, 'node_modules/expo-router'),
};

module.exports = config; 