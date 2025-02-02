import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import { useTranslation } from 'react-i18next'

const menuAt = ({ account }: { account: Mastodon.Account }): ContextMenu[][] => {
  const { t } = useTranslation('componentContextMenu')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const menus: ContextMenu[][] = []

  menus.push([
    {
      key: 'at-direct',
      item: {
        onSelect: () =>
          navigation.navigate('Screen-Compose', {
            type: 'conversation',
            accts: [account.acct],
            visibility: 'direct'
          }),
        disabled: false,
        destructive: false,
        hidden: false
      },
      title: t('at.direct'),
      icon: 'envelope'
    },
    {
      key: 'at-public',
      item: {
        onSelect: () =>
          navigation.navigate('Screen-Compose', {
            type: 'conversation',
            accts: [account.acct],
            visibility: 'public'
          }),
        disabled: false,
        destructive: false,
        hidden: false
      },
      title: t('at.public'),
      icon: 'at'
    }
  ])

  return menus
}

export default menuAt
