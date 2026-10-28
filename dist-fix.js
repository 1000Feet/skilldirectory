const fs = require('fs');
const path = require('path');

// Path to the dist folder
const distPath = path.join(__dirname, 'dist');

// Function to fix the index.html file
function fixIndexHtml() {
  const indexPath = path.join(distPath, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add the config.js script before any other scripts
  indexContent = indexContent.replace(
    '<head>',
    `<head>
    <!-- Hostinger runtime config - MUST BE LOADED BEFORE ANY OTHER SCRIPTS -->
    <script src="/config.js"></script>`
  );
  
  // Convert relative paths to absolute paths with the domain
  indexContent = indexContent.replace(
    /src="\/assets\//g, 
    'src="https://skilldirectory.com/assets/'
  );
  
  indexContent = indexContent.replace(
    /href="\/assets\//g, 
    'href="https://skilldirectory.com/assets/'
  );
  
  // Ensure script tags have crossorigin attribute
  indexContent = indexContent.replace(
    /<script type="module" crossorigin src="([^"]+)">/g,
    '<script type="module" crossorigin src="$1">'
  );
  
  // Save the modified index.html
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ index.html has been fixed');
}

// Function to copy the config.js and .htaccess files to dist
function copyConfigFiles() {
  // Copy config.js
  const configSrc = path.join(__dirname, 'public', 'config.js');
  const configDest = path.join(distPath, 'config.js');
  fs.copyFileSync(configSrc, configDest);
  console.log('✅ config.js has been copied to dist');
  
  // Copy .htaccess
  const htaccessSrc = path.join(__dirname, 'public', '.htaccess');
  const htaccessDest = path.join(distPath, '.htaccess');
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('✅ .htaccess has been copied to dist');
}

// Main function
function main() {
  console.log('📦 Starting post-build fixes for deployment...');
  
  // Create a backup of the original index.html
  const indexPath = path.join(distPath, 'index.html');
  const backupPath = path.join(distPath, 'index.html.bak');
  fs.copyFileSync(indexPath, backupPath);
  console.log('✅ Created backup of index.html');
  
  // Fix the index.html file
  fixIndexHtml();
  
  // Copy config files
  copyConfigFiles();
  
  console.log('✅ All fixes completed successfully!');
  console.log('📤 Your app is ready to be deployed to Hostinger.');
}

// Run the main function
main();
