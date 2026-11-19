const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for .wasm files as assets
config.resolver.assetExts.push('wasm');

// Configure source map URL for proper error handling
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (!url.match(/^[a-zA-Z]:\\.*|^\/|^\.\.?\//)) {
      return url;
    }
    return url;
  },
};

module.exports = config;
