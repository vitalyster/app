import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import { MMKV } from 'react-native-mmkv'

export const storage: { global: MMKV; account?: MMKV } = { global: new MMKV(), account: undefined }

export const secureStorage = createSecureStore()

// Clear keychain on fresh install (MMKV wiped but keychain persists)
const appInstalled = storage.global.getBoolean('app.installed')
if (!appInstalled) {
  try {
    secureStorage.clear()
  } catch {}
  storage.global.set('app.installed', true)
}

export const GLOBAL: { connect?: boolean } = {
  connect: undefined
}
