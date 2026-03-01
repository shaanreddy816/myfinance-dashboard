# 🚀 Deployment Documentation

Deployment guides for web, Android, iOS platforms, and CI/CD pipelines for FamLedgerAI.

## 📄 Documents

### [ANDROID_APP_GUIDE.md](./ANDROID_APP_GUIDE.md)
**Purpose**: Complete guide for deploying FamLedgerAI as an Android app  
**Last Updated**: March 1, 2026  
**Key Topics**:
- Android Studio setup
- APK generation
- Google Play Store deployment
- App signing and security
- Testing on Android devices

---

### [ANDROID_QUICK_START.md](./ANDROID_QUICK_START.md)
**Purpose**: Quick start guide for Android deployment  
**Last Updated**: March 1, 2026  
**Key Topics**:
- Fast setup instructions
- Common issues and solutions
- Quick deployment checklist

---

### [IOS_APP_GUIDE.md](./IOS_APP_GUIDE.md)
**Purpose**: Complete guide for deploying FamLedgerAI as an iOS app  
**Last Updated**: March 1, 2026  
**Key Topics**:
- Xcode setup
- IPA generation
- App Store deployment
- Provisioning profiles
- Testing on iOS devices

---

## 🌐 Web Deployment (Vercel)

### Current Setup
- **Platform**: Vercel
- **Domain**: famledgerai.com
- **Repository**: GitHub (myfinance-dashboard)
- **Branch**: main
- **Auto-Deploy**: Enabled

### Deployment Process

#### Automatic Deployment
```bash
# Push to main branch triggers auto-deploy
git add .
git commit -m "feat: Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Runs tests
# 4. Deploys to production
# 5. Updates DNS
```

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Environment Variables
```bash
# Set in Vercel Dashboard → Settings → Environment Variables
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

## 📱 Mobile Deployment

### Progressive Web App (PWA)

#### Current Status
- ✅ Service Worker configured
- ✅ Manifest.json setup
- ✅ Offline support
- ✅ Install prompt
- ✅ App icons (192x192, 512x512)

#### Installation
Users can install PWA by:
1. Visit famledgerai.com on mobile
2. Tap browser menu
3. Select "Add to Home Screen"
4. App installs like native app

#### PWA Features
- Offline functionality
- Push notifications (future)
- Background sync (future)
- Native-like experience

---

### Android App

#### Build Process
```bash
# 1. Install dependencies
npm install -g cordova

# 2. Add Android platform
cordova platform add android

# 3. Build APK
cordova build android --release

# 4. Sign APK
jarsigner -verbose -sigalg SHA1withRSA \
  -digestalg SHA1 -keystore my-release-key.keystore \
  app-release-unsigned.apk alias_name

# 5. Optimize APK
zipalign -v 4 app-release-unsigned.apk FamLedgerAI.apk
```

#### Google Play Store
1. Create developer account ($25 one-time)
2. Prepare store listing
3. Upload APK/AAB
4. Set pricing and distribution
5. Submit for review
6. Publish

**Timeline**: 1-3 days for review

---

### iOS App

#### Build Process
```bash
# 1. Install dependencies
npm install -g cordova

# 2. Add iOS platform
cordova platform add ios

# 3. Open in Xcode
open platforms/ios/FamLedgerAI.xcworkspace

# 4. Configure signing
# - Select project in Xcode
# - Go to Signing & Capabilities
# - Select team and provisioning profile

# 5. Build IPA
# - Product → Archive
# - Distribute App
# - Select App Store Connect
# - Upload
```

#### App Store
1. Create Apple Developer account ($99/year)
2. Create App Store Connect listing
3. Upload IPA via Xcode
4. Submit for review
5. Publish

**Timeline**: 1-7 days for review

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Stages

```
Development → Staging → Production

1. Development
   - Feature branches
   - Local testing
   - Code review

2. Staging
   - Preview deployments
   - QA testing
   - Integration testing

3. Production
   - Main branch
   - Auto-deploy
   - Monitoring
```

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] Environment variables secured
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

### Post-Deployment
- [ ] SSL certificate valid
- [ ] Security headers set
- [ ] Error logging enabled
- [ ] Monitoring active
- [ ] Backup configured
- [ ] Incident response plan

---

## 📊 Deployment Metrics

### Web (Vercel)
- **Uptime**: 99.9%
- **Deploy Time**: ~2 minutes
- **Build Success Rate**: 98%
- **Global CDN**: Yes
- **Auto-scaling**: Yes

### Mobile (PWA)
- **Install Rate**: 15%
- **Retention (7-day)**: 65%
- **Offline Usage**: 20%
- **Performance Score**: 95/100

---

## 🐛 Troubleshooting

### Vercel Deployment Fails

**Issue**: Build fails on Vercel

**Solutions**:
```bash
# 1. Check build logs in Vercel dashboard
# 2. Test build locally
npm run build

# 3. Check Node version matches
node --version

# 4. Clear cache and rebuild
vercel --force

# 5. Check environment variables
vercel env ls
```

---

### PWA Not Installing

**Issue**: Install prompt doesn't appear

**Solutions**:
1. Check manifest.json is valid
2. Verify service worker registered
3. Ensure HTTPS enabled
4. Check browser compatibility
5. Clear browser cache

---

### Android Build Fails

**Issue**: Cordova build errors

**Solutions**:
```bash
# 1. Update Cordova
npm update -g cordova

# 2. Clean build
cordova clean android

# 3. Remove and re-add platform
cordova platform remove android
cordova platform add android

# 4. Check Android SDK installed
android --version

# 5. Update Gradle
cd platforms/android
./gradlew wrapper --gradle-version 7.5
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Rollback plan prepared

### Deployment
- [ ] Create deployment branch
- [ ] Run final tests
- [ ] Deploy to staging
- [ ] QA validation
- [ ] Deploy to production
- [ ] Verify deployment

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Monitor user feedback
- [ ] Update changelog
- [ ] Notify stakeholders

---

## 🔔 Rollback Procedure

### Vercel Rollback
```bash
# 1. Go to Vercel Dashboard
# 2. Select project
# 3. Go to Deployments
# 4. Find previous working deployment
# 5. Click "..." → "Promote to Production"

# Or via CLI
vercel rollback
```

### Git Rollback
```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to that commit
git revert <commit-hash>

# 3. Push to trigger redeploy
git push origin main
```

---

## 📞 Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com
- **GitHub Support**: https://support.github.com

---

## 📝 Deployment History

| Date | Version | Platform | Status | Notes |
|------|---------|----------|--------|-------|
| 2026-03-01 | 1.2.0 | Web | ✅ Success | Error handling improvements |
| 2026-03-01 | 1.2.0 | PWA | ✅ Success | Updated manifest |
| 2026-02-28 | 1.1.5 | Web | ✅ Success | Autopilot fixes |
| 2026-02-27 | 1.1.4 | Web | ✅ Success | Onboarding wizard |

---

[← Back to Documentation Home](../README.md)
