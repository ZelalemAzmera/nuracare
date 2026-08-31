const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Add monorepo root node_modules to watchFolders for local development.
// On EAS cloud, the parent directory doesn't exist, so this is safely skipped.
const rootNodeModules = path.resolve(__dirname, '../../node_modules');
if (fs.existsSync(rootNodeModules)) {
  config.watchFolders = [
    ...(config.watchFolders || []),
    rootNodeModules,
  ];
}

module.exports = config;
