import { ExpoConfig } from '@expo/config'
import { version } from './package.json'
import 'dotenv/config'

const locales = [
  'be',
  'ca',
  'de',
  'el',
  'en',
  'es',
  'eu',
  'fr',
  'it',
  'ja',
  'ko',
  'nb',
  'nl',
  'pl',
  'pt-BR',
  'sv',
  'uk',
  'vi',
  'zh-Hans',
  'zh-Hant'
]

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  scheme: ['tooot', 'com.xmflsct.app.tooot'],
  version,
  icon: './assets/images/icon.png',
  // Localized Info.plist strings (permission descriptions)
  locales: Object.fromEntries(locales.map(l => [l, `./assets/locales/${l}.json`])),
  // @ts-ignore
  extra: { environment: process.env.ENVIRONMENT },
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot',
    appleTeamId: '8EGBLQ2MA6',
    supportsTablet: true,
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
      LSApplicationCategoryType: 'public.app-category.social-networking',
      NSPhotoLibraryUsageDescription:
        'Allow $(PRODUCT_NAME) to access your camera roll to attach photos or videos to your toot',
      NSPhotoLibraryAddUsageDescription: 'Allow $(PRODUCT_NAME) to save an image to your camera roll',
      NSMicrophoneUsageDescription:
        '$(PRODUCT_NAME) DOES NOT need microphone permission. Please reject this request.',
      // iOS 27 requires the UIScene lifecycle
      UIApplicationSceneManifest: {
        UIApplicationSupportsMultipleScenes: false,
        UISceneConfigurations: {
          UIWindowSceneSessionRoleApplication: [
            {
              UISceneConfigurationName: 'Default Configuration',
              UISceneDelegateClassName: 'EXExpoAppSceneDelegate'
            }
          ]
        }
      }
    },
    entitlements: {
      'com.apple.security.app-sandbox': true,
      'com.apple.security.device.camera': true,
      'com.apple.security.network.client': true,
      'com.apple.security.personal-information.photos-library': true
    }
  },
  android: {
    package: 'com.xmflsct.app.tooot',
    permissions: ['NOTIFICATIONS', 'CAMERA', 'VIBRATE'],
    blockedPermissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundColor: '#FFFFFF'
    }
  },
  plugins: [
    'expo-localization',
    '@sentry/react-native',
    'expo-image',
    [
      'expo-splash-screen',
      {
        image: './assets/images/android-icon-foreground.png',
        backgroundColor: '#FAFAFA',
        dark: { image: './assets/images/android-icon-foreground.png', backgroundColor: '#121212' }
      }
    ],
    'expo-web-browser',
    'expo-secure-store',
    ['expo-build-properties', { ios: { deploymentTarget: '16.4' } }],
    [
      'expo-notifications',
      {
        mode: 'production',
        icon: './assets/images/android-notification-icon.png',
        sounds: ['./assets/sounds/boop.mp3']
      }
    ],
    [
      'expo-share-intent',
      {
        iosActivationRules: {
          NSExtensionActivationSupportsImageWithMaxCount: 4,
          NSExtensionActivationSupportsMovieWithMaxCount: 1,
          NSExtensionActivationSupportsText: true,
          NSExtensionActivationSupportsWebURLWithMaxCount: 1
        },
        androidIntentFilters: ['text/*', 'image/*', 'video/*'],
        androidMultiIntentFilters: ['image/*']
      }
    ],
    // Configure expo-video plugin for PiP and background playback
    [
      'expo-video',
      {
        supportsPictureInPicture: true,
        supportsBackgroundPlayback: false
      }
    ]
  ]
})
