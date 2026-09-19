import * as Notifications from 'expo-notifications'
import log from './log'

const push = () => {
  log('log', 'Push', 'initializing')
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false
    })
  })
}

export default push
