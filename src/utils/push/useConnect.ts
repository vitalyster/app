import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { useAppDispatch } from '@root/store'
import * as Sentry from '@sentry/react-native'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getExpoToken, retrieveExpoToken } from '@utils/slices/appSlice'
import { disableAllPushes } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import { TFunction } from 'i18next'
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useSelector } from 'react-redux'

export interface Params {
  t: TFunction<'screens'>
  instances: InstanceLatest[]
}

const pushUseConnect = ({ t, instances }: Params) => {
  const dispatch = useAppDispatch()
  const { theme } = useTheme()
  useEffect(() => {
    dispatch(retrieveExpoToken())
  }, [])

  const expoToken = useSelector(getExpoToken)

  const connect = () => {
    apiTooot({
      method: 'get',
      url: `push/connect/${expoToken}`,
      sentry: true
    })
      .then(() => Notifications.setBadgeCountAsync(0))
      .catch(error => {
        Sentry.setExtras({
          API: 'tooot',
          ...(error?.response && { response: error.response }),
          ...(error?.request && { request: error.request })
        })
        Sentry.captureException(error)
        Notifications.setBadgeCountAsync(0)
        if (error?.status == 404) {
          displayMessage({
            theme,
            type: 'error',
            duration: 'long',
            message: t('pushError.message'),
            description: t('pushError.description'),
            onPress: () => {
              navigationRef.navigate('Screen-Tabs', {
                screen: 'Tab-Me',
                params: {
                  screen: 'Tab-Me-Root'
                }
              })
              navigationRef.navigate('Screen-Tabs', {
                screen: 'Tab-Me',
                params: {
                  screen: 'Tab-Me-Settings'
                }
              })
            }
          })

          dispatch(disableAllPushes())

          instances.forEach(instance => {
            if (instance.push.global.value) {
              apiGeneral<{}>({
                method: 'delete',
                domain: instance.url,
                url: 'api/v1/push/subscription',
                headers: {
                  Authorization: `Bearer ${instance.token}`
                }
              }).catch(() => console.log('error!!!'))
            }
          })
        }
      })
  }

  const pushEnabled = instances.filter(instance => instance.push.global.value)

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', state => {
      if (expoToken && pushEnabled.length && state === 'active') {
        Notifications.getBadgeCountAsync().then(count => {
          if (count > 0) {
            connect()
          }
        })
      }
    })

    return () => {
      appStateListener.remove()
    }
  }, [expoToken, pushEnabled.length])

  return useEffect(() => {
    if (expoToken && pushEnabled.length) {
      connect()
    }
  }, [expoToken, pushEnabled.length])
}

export default pushUseConnect
