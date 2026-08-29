# NuraCare Mobile APK Placement

Place your built standalone Android APK here as `nuracare.apk` (`apps/web/public/nuracare.apk`).

### How to build the APK:
1. Navigate to `apps/mobile`:
   ```bash
   cd apps/mobile
   ```
2. Run EAS Build for Android preview:
   ```bash
   npx eas build -p android --profile preview
   ```
3. Once the build finishes on Expo servers, download the `.apk` file.
4. Copy/rename that file into this directory:
   `apps/web/public/nuracare.apk`
5. Deploy or push to Vercel. Users visiting the web app can click "Download App (APK)" or scan the QR code to install it directly onto their Android devices!
