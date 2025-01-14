import GracefullyImage from '@components/GracefullyImage'
import navigationRef from '@utils/navigation/navigationRef'
import { useGlobalStorage } from '@utils/storage/actions'
import React, { useContext } from 'react'
import { Dimensions, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './Context'

const AccountHeader: React.FC = () => {
  const { account } = useContext(AccountContext)

  const topInset = useSafeAreaInsets().top

  useGlobalStorage.string('account.active')

  return (
    <GracefullyImage
      uri={{ original: account?.header, static: account?.header_static }}
      style={{ height: Dimensions.get('window').width / 3 + topInset }}
      onPress={() => {
        if (account) {
          Image.getSize(account.header, (width, height) =>
            navigationRef.navigate('Screen-ImagesViewer', {
              imageUrls: [{ id: 'avatar', url: account.header, width, height }],
              id: 'avatar',
              hideCounter: true
            })
          )
        }
      }}
    />
  )
}

export default AccountHeader
