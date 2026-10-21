const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine whether we are executing from the repository root or inside frontend/
const isRoot = fs.existsSync(path.join(__dirname, 'frontend', 'package.json'));
const frontendDir = isRoot ? path.join(__dirname, 'frontend') : __dirname;

console.log(`[build.js] Building MatchMind AI frontend from: ${frontendDir}`);

// 1. Install frontend dependencies
console.log('[build.js] Installing frontend dependencies...');
execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

// 2. Build Vite production bundle
console.log('[build.js] Running Vite production build...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 3. Mirror dist to root ./dist so both "./dist" and "./frontend/dist" are populated
const srcDist = path.join(frontendDir, 'dist');
if (isRoot) {
  const rootDist = path.join(__dirname, 'dist');
  fs.cpSync(srcDist, rootDist, { recursive: true });
  console.log('[build.js] Mirrored static assets to ./dist and ./frontend/dist');
}

console.log('[build.js] Frontend build completed successfully!');
