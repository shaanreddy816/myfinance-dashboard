# Vercel Deployment Fix

## Problem Identified

The error `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"` was caused by Vercel's catch-all rewrite rule.

The old `vercel.json` had:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

This redirected ALL requests (including `/assets/main-*.js`) to `/index.html`, causing the browser to receive HTML instead of JavaScript.

## Changes Made

### 1. Updated `vercel.json`

Added:
- `"buildCommand": "npm run build"` - Tells Vercel to run the Vite build
- `"outputDirectory": "dist"` - Tells Vercel to serve files from the dist folder
- Cache headers for `/assets/*` - Optimizes asset loading
- `"routes"` section - Properly handles asset requests before the catch-all

The new routes configuration:
```json
"routes": [
  { "src": "/assets/(.*)", "dest": "/assets/$1" },
  { "src": "/(.*)", "dest": "/index.html" }
]
```

This ensures `/assets/*` files are served directly, not redirected to index.html.

### 2. Updated `index.html`

Added timeout and error handling to module loading:
- 10-second timeout instead of infinite wait
- Detailed console logging for debugging
- User-friendly error message if modules fail to load

## Files Changed

1. `famledgerai/vercel.json` - Vercel deployment configuration
2. `famledgerai/index.html` - Module loading error handling

## To Deploy

1. Commit both files:
   ```bash
   git add vercel.json index.html
   git commit -m "Fix Vercel deployment: serve assets correctly and add module loading timeout"
   git push origin feature/stress-testing-layer
   ```

2. Wait for Vercel to deploy (should take 1-2 minutes)

3. Test on https://dev.famledgerai.com/

## Expected Console Output

After deployment, you should see:
```
🔄 Waiting for modules to load...
✅ FamLedgerAI modules loaded
📦 Forecast Engine: 9 functions
📦 Risk Engine: 5 functions
📦 Stress Engine: 5 functions
🔐 Supabase client initialized
✅ Modules loaded after X ms
✅ Modules loaded, initializing app...
```

If you still see errors, check:
1. Network tab - verify `/assets/main-*.js` returns JavaScript (not HTML)
2. Console - look for specific error messages
3. Vercel build logs - ensure build completed successfully
