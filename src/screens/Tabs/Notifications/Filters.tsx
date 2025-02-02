import { HeaderLeft, HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useQueryClient } from '@tanstack/react-query'
import { TabNotificationsStackScreenProps } from '@utils/navigation/navigators'
import { PUSH_ADMIN, PUSH_DEFAULT } from '@utils/push/constants'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { setAccountStorage, useAccountStorage } from '@utils/storage/actions'
import { isEqual } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const TabNotificationsFilters: React.FC<
  TabNotificationsStackScreenProps<'Tab-Notifications-Filters'>
> = ({ navigation }) => {
  const { t } = useTranslation(['common', 'screenTabs'])

  const [instanceNotificationsFilter] = useAccountStorage.object('notifications')
  const [filters, setFilters] = useState(instanceNotificationsFilter)

  const queryClient = useQueryClient()
  useEffect(() => {
    const changed = !isEqual(instanceNotificationsFilter, filters)
    navigation.setOptions({
      title: t('screenTabs:notifications.filters.title'),
      headerLeft: () => (
        <HeaderLeft
          content='ChevronDown'
          onPress={() => {
            if (changed) {
              Alert.alert(t('common:discard.title'), t('common:discard.message'), [
                {
                  text: t('common:buttons.discard'),
                  style: 'destructive',
                  onPress: () => navigation.goBack()
                },
                {
                  text: t('common:buttons.cancel'),
                  style: 'default'
                }
              ])
            } else {
              navigation.goBack()
            }
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('common:buttons.apply')}
          onPress={() => {
            if (changed) {
              setAccountStorage([{ key: 'notifications', value: filters }])
              const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
              queryClient.invalidateQueries({ queryKey })
            }
            navigation.goBack()
          }}
        />
      )
    })
  }, [filters])

  return (
    <ScrollView style={{ flex: 1 }}>
      <MenuContainer>
        {PUSH_DEFAULT().map((type, index) => (
          <MenuRow
            key={index}
            title={t(`screenTabs:me.push.${type}.heading`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
      </MenuContainer>
      <MenuContainer>
        {PUSH_ADMIN().map(({ type }) => (
          <MenuRow
            key={type}
            title={t(`screenTabs:me.push.${type}.heading`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
      </MenuContainer>
    </ScrollView>
  )
}

export default TabNotificationsFilters
