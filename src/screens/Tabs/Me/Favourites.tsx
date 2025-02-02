import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabMeStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'

const TabMeFavourites: React.FC<
  NativeStackScreenProps<TabMeStackParamList, 'Tab-Me-Favourites'>
> = ({ navigation }) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Favourites' }]
  useEffect(() => {
    navigation.setParams({ queryKey: queryKey })
  }, [])

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

export default TabMeFavourites
