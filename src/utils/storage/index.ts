import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import { MMKV } from 'react-native-mmkv'

export const storage: { global: MMKV; account?: MMKV } = { global: new MMKV(), account: undefined }

export const secureStorage = createSecureStore()

// Clear Keychain on fresh install (MMKV wiped but Keychain persists).
// Wrapped in try/catch since secureStorage might not be fully initialized
// at module load time (e.g. if its internal MMKV isn't ready yet).
try {
  const appInstalled = storage.global.getBoolean('app.installed')
  if (!appInstalled) {
    secureStorage.removeItem('persist:instances').catch(() => {})
    storage.global.set('app.installed', true)
  }
} catch {
  // secureStorage not ready yet — will be cleared on next cold boot
}

export const GLOBAL: { connect?: boolean } = {
  connect: undefined
}
