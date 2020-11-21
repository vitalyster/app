import React from 'react'

import ScreenSharedAccount from 'src/screens/Shared/Account'
import ScreenSharedHashtag from 'src/screens/Shared/Hashtag'
import ScreenSharedToot from 'src/screens/Shared/Toot'
import ScreenSharedWebview from 'src/screens/Shared/Webview'
import PostToot from 'src/screens/Shared/Compose'
import { TypedNavigator } from '@react-navigation/native'
import { NativeStackNavigationOptions } from 'react-native-screens/lib/typescript'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigatorProps
} from 'react-native-screens/lib/typescript/types'

const sharedScreens = (
  Stack: TypedNavigator<
    Record<string, object | undefined>,
    any,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    ({
      initialRouteName,
      children,
      screenOptions,
      ...rest
    }: NativeStackNavigatorProps) => JSX.Element
  >
) => {
  return [
    <Stack.Screen
      key='Screen-Shared-Account'
      name='Screen-Shared-Account'
      component={ScreenSharedAccount}
      options={{
        headerTranslucent: true,
        headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
        headerCenter: () => <></>
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Hashtag'
      name='Screen-Shared-Hashtag'
      component={ScreenSharedHashtag}
      options={({ route }: any) => ({
        title: `#${decodeURIComponent(route.params.hashtag)}`
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Toot'
      name='Screen-Shared-Toot'
      component={ScreenSharedToot}
      options={() => ({
        title: '对话'
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Webview'
      name='Screen-Shared-Webview'
      component={ScreenSharedWebview}
      // options={({ route }) => ({
      //   title: `${route.params.domain}`
      // })}
    />,
    <Stack.Screen
      key='Screen-Shared-PostToot'
      name='Screen-Shared-PostToot'
      component={PostToot}
      options={{
        stackPresentation: 'fullScreenModal'
      }}
    />
  ]
}

export default sharedScreens