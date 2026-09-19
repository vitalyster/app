import { ExpoConfig } from '@expo/config'
import { version } from './package.json'
import 'dotenv/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  scheme: 'tooot',
  version,
  // @ts-ignore
  extra: { environment: process.env.ENVIRONMENT },
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot'
  },
  android: {
    package: 'com.xmflsct.app.tooot',
    permissions: ['NOTIFICATIONS', 'CAMERA', 'VIBRATE'],
    blockedPermissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    googleServicesFile: './android/app/google-services.json'
  },
  plugins: [
    'expo-localization',
    '@sentry/react-native',
    'expo-image',
    'expo-splash-screen',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        sounds: ['./assets/sounds/boop.mp3']
      }
    ],
    // Configure expo-video plugin for PiP and background playback
    ['expo-video', {
      supportsPictureInPicture: true,
      supportsBackgroundPlayback: false
    }]
  ]
})
