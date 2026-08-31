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

// Fix for react-freeze 1.0.4 missing src/index.tsx
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-freeze') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('react-freeze/dist/index.js')
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
