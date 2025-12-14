# Progressive Web App (PWA) Setup Guide

## Overview
Culture Club is now a fully installable Progressive Web App! Users can add it to their home screen and use it like a native app.

## What's Been Set Up

✅ **Manifest.json** - App metadata for installation
✅ **Service Worker** - Offline support and caching
✅ **App Icons** - 192x192 and 512x512 icons
✅ **Mobile Meta Tags** - iOS and Android optimization
✅ **Installable** - "Add to Home Screen" prompt ready

## How Users Install the App

### On Android (Chrome/Edge)
1. Visit your app URL
2. Chrome shows "Install app" banner automatically
3. OR tap menu (⋮) → "Install app" or "Add to Home Screen"
4. App appears on home screen like native app

### On iOS (Safari)
1. Visit your app URL in Safari
2. Tap Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Edit name if desired, tap "Add"
5. App appears on home screen

### On Desktop (Chrome/Edge)
1. Visit your app URL
2. Look for install icon (⊕) in address bar
3. Click it and confirm
4. App opens in standalone window

## Features Users Get

**Standalone Mode:**
- No browser UI (no address bar, back button)
- Looks like native app
- Full screen experience

**Offline Support:**
- Basic caching implemented
- App loads even without internet
- Service worker handles offline requests

**Fast Loading:**
- Cached assets load instantly
- Improved performance

**App-Like Feel:**
- Custom splash screen (your app colors)
- App icon on home screen
- Appears in app switcher

## Customization Options

### Change App Name
Edit `/app/frontend/public/manifest.json`:
```json
{
  "name": "Your Custom Name",
  "short_name": "Short Name"
}
```

### Change Theme Colors
```json
{
  "theme_color": "#354F52",
  "background_color": "#F5F5F1"
}
```

### Update Icons
Replace `/app/frontend/public/icon-192.svg` and `icon-512.svg` with your custom icons.

For best results, use:
- 192x192px for mobile
- 512x512px for high-res displays
- PNG format with transparency

### Add Splash Screens (iOS)
Add to `index.html`:
```html
<link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)">
<link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)">
```

## Testing PWA Features

### 1. Test Service Worker
```bash
# Open browser console
# Go to Application tab → Service Workers
# Should show "activated and running"
```

### 2. Test Installation
**Desktop:**
- Chrome: Installable icon appears in address bar
- Edge: Similar behavior

**Mobile:**
- Android Chrome: Install banner shows after 30 seconds
- iOS Safari: Use Share → Add to Home Screen

### 3. Test Offline
```bash
# In Chrome DevTools:
# Network tab → Throttling → Offline
# Refresh page - should still load cached version
```

### 4. Lighthouse Audit
```bash
# In Chrome DevTools:
# Lighthouse tab → Generate report
# Should score 90+ for PWA
```

## Distribution & Marketing

### Share Installation Link
Give users direct link with instructions:
```
Visit https://your-app.com
On Android: Tap "Install app" when prompted
On iOS: Tap Share → Add to Home Screen
```

### QR Code
Generate QR code linking to your app:
- https://qr-code-generator.com
- Users scan → opens app → install prompt

### Social Media Posts
**Template:**
"Try Culture Club! 
📱 Works on any device
⚡ Install to home screen
🔔 Get reminder notifications
🌐 No app store needed
👉 [your-link]"

### Email Signature
"Try Culture Club - The fermentation tracker app
Install now: [your-link] (works on all devices!)"

## Advantages Over Native Apps

✅ **No App Store Approval** - Deploy instantly
✅ **Works Everywhere** - iOS, Android, desktop
✅ **One Codebase** - Maintain single app
✅ **Instant Updates** - No review delays
✅ **Lower Costs** - No $99/year fees
✅ **Better SEO** - Google can index it
✅ **Easy Sharing** - Just send a link
✅ **Lower Friction** - No download/install barriers

## Current PWA Score

Run Lighthouse audit to check:
- Performance: ~90+
- Best Practices: ~90+
- SEO: ~90+
- PWA: ~90+ (installable, works offline, etc.)

## Improving PWA Experience

### Add Push Notifications
Already integrated with Firebase Cloud Messaging!
See `firebase-setup.md` for details.

### Add Offline Functionality
Enhance service worker to cache more resources:
```javascript
// In service-worker.js
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/fonts.woff2',
  // Add more assets
];
```

### Add Background Sync
For posting when back online:
```javascript
// Register sync
navigator.serviceWorker.ready.then(sw => {
  return sw.sync.register('sync-posts');
});
```

### Add App Shortcuts
In manifest.json:
```json
{
  "shortcuts": [
    {
      "name": "New Project",
      "url": "/projects?action=new",
      "icons": [{"src": "/shortcut-icon.png", "sizes": "96x96"}]
    }
  ]
}
```

## Monitoring PWA Usage

### Check Installation Rate
```javascript
// In your analytics
window.addEventListener('appinstalled', () => {
  gtag('event', 'app_installed');
});
```

### Track Standalone Usage
```javascript
// Check if launched from home screen
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Launched as PWA');
}
```

## Troubleshooting

### Install button not showing
- Ensure HTTPS (required for PWA)
- Check manifest.json is valid
- Service worker must be registered
- Some browsers need user interaction first

### Service worker not updating
```bash
# Clear old service worker
# Chrome DevTools → Application → Service Workers
# Click "Unregister"
# Refresh page
```

### iOS not saving to home screen
- Must use Safari (not Chrome on iOS)
- Ensure apple-mobile-web-app tags are present
- Check icon paths are correct

## Production Checklist

- [ ] Replace placeholder icons with branded icons
- [ ] Update app name and description
- [ ] Test installation on iOS
- [ ] Test installation on Android
- [ ] Test offline functionality
- [ ] Run Lighthouse audit
- [ ] Add PWA install instructions to landing page
- [ ] Monitor installation analytics
- [ ] Add app screenshots to manifest
- [ ] Configure proper caching strategy

---

**Your app is now installable!** 
Users can add Culture Club to their home screen and use it like a native app. No app store needed! 🎉
