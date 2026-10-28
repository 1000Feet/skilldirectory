import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Function to run a command and log output
function runCommand(command) {
  console.log(`👉 Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.toString());
    return false;
  }
}

// Function to modify the index.html file in dist
function fixIndexHtml() {
  console.log('🔧 Fixing index.html file...');
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist folder. Build may have failed.');
    return false;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add config.js script
  if (!content.includes('/config.js')) {
    content = content.replace(
      '<head>',
      `<head>
    <!-- Hostinger runtime config - MUST BE LOADED BEFORE ANY OTHER SCRIPTS -->
    <script src="/config.js"></script>`
    );
  }
  
  // Make sure all scripts have proper MIME type attributes
  content = content.replace(
    /<script type="module"/g,
    '<script type="module" crossorigin'
  );
  
  // Ensure absolute URLs for assets
  content = content.replace(
    /src="\/assets\//g,
    'src="https://skilldirectory.com/assets/'
  );
  
  content = content.replace(
    /href="\/assets\//g,
    'href="https://skilldirectory.com/assets/'
  );
  
  // Save modifications
  fs.writeFileSync(indexPath, content);
  console.log('✅ index.html has been modified');
  return true;
}

// Function to copy needed configuration files to dist
function copyConfigFiles() {
  console.log('📂 Copying configuration files to dist...');
  
  // Copy .htaccess
  const htaccessSrc = path.join(PUBLIC_DIR, '.htaccess');
  const htaccessDest = path.join(DIST_DIR, '.htaccess');
  fs.copyFileSync(htaccessSrc, htaccessDest);
  
  // Copy config.js
  const configSrc = path.join(PUBLIC_DIR, 'config.js');
  const configDest = path.join(DIST_DIR, 'config.js');
  fs.copyFileSync(configSrc, configDest);
  
  // Copy site.webmanifest
  const manifestSrc = path.join(PUBLIC_DIR, 'site.webmanifest');
  const manifestDest = path.join(DIST_DIR, 'site.webmanifest');
  fs.copyFileSync(manifestSrc, manifestDest);
  
  console.log('✅ Configuration files copied successfully');
  return true;
}

// Create a deployment verification file
function createVerificationFile() {
  const verificationFile = path.join(DIST_DIR, 'verification.txt');
  const timestamp = new Date().toISOString();
  fs.writeFileSync(verificationFile, `Skill Directory deployment completed at ${timestamp}`);
  console.log('✅ Created verification file');
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting Skill Directory deployment to Hostinger...');
  
  // Step 1: Clean previous build
  console.log('\n📦 Cleaning previous build...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('✅ Previous build cleaned');
  }
  
  // Step 2: Build the project
  console.log('\n🔨 Building the project...');
  if (!runCommand('npm run build')) {
    console.error('❌ Build failed. Aborting deployment.');
    return;
  }
  console.log('✅ Build completed successfully');
  
  // Step 3: Fix index.html
  console.log('\n🔧 Fixing files for Hostinger...');
  if (!fixIndexHtml()) {
    console.error('❌ Failed to fix index.html. Aborting deployment.');
    return;
  }
  
  // Step 4: Copy config files
  if (!copyConfigFiles()) {
    console.error('❌ Failed to copy config files. Aborting deployment.');
    return;
  }
  
  // Step 5: Create verification file
  createVerificationFile();
  
  console.log('\n✨ Deployment preparation completed successfully!');
  console.log('📤 The dist folder is now ready to be uploaded to Hostinger.');
  console.log('\n📋 Deployment checklist:');
  console.log('1. Upload ALL files in the dist folder to your Hostinger root directory');
  console.log('2. Make sure config.js and .htaccess are in the root directory');
  console.log('3. After uploading, verify everything works by visiting https://skilldirectory.com');
}

// Run the deployment
deploy().catch(error => {
  console.error('❌ Deployment failed with error:', error);
  process.exit(1);
});
