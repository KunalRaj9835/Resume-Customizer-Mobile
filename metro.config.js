const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('glb'); // allow bundling 3D models
// Force a single copy of three.js (avoids "Multiple instances of Three.js" and broken instanceof checks).
const threeCjs = require('path').join(__dirname, 'node_modules/three/build/three.cjs');
const orig = config.resolver.resolveRequest;
config.resolver.resolveRequest = (ctx, name, platform) =>
  name === 'three' ? { type: 'sourceFile', filePath: threeCjs } : (orig ?? ctx.resolveRequest)(ctx, name, platform);
module.exports = config;
