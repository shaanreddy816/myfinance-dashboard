// build.js
const fs = require('fs');
const path = require('path');

// Read the HTML template
const html = fs.readFileSync('index.html', 'utf8');

// Replace placeholders with environment variables
const result = html
    .replace('__SUPABASE_URL__', process.env.SUPABASE_URL || '')
    .replace('__SUPABASE_ANON_KEY__', process.env.SUPABASE_ANON_KEY || '');

// Create dist folder and write final HTML
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', result);

console.log('✅ Build complete. Environment variables injected.');