const fs = require('fs');
const path = require('path');

const src = 'D:\\Cureza\\Favicon.png';
const dest = path.join(__dirname, 'public', 'favicon.png');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Favicon copied successfully from ' + src + ' to ' + dest);
  } else {
    console.warn('Warning: Source favicon not found at ' + src);
  }
} catch (err) {
  console.error('Failed to copy favicon:', err);
}
