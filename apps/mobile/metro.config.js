const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure abort-controller resolves correctly from the monorepo root node_modules
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'abort-controller': path.resolve(__dirname, 'node_modules/abort-controller'),
};

// Watch root node_modules as well (monorepo support)
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, '../../node_modules'),
];

module.exports = config;
