import ComponentAccount from '@components/Account'
import ComponentSeparator from '@components/Separator'
import TimelineEmpty from '@components/Timelines/Timeline/Empty'
import TimelineEnd from '@root/components/Timelines/Timeline/End'
import { useScrollToTop } from '@react-navigation/native'
import { relationshipsFetch } from '@utils/fetches/relationshipsFetch'
import React, { useCallback, useMemo, useRef } from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useInfiniteQuery } from 'react-query'

export interface Props {
  id: Mastodon.Account['id']
  type: 'following' | 'followers'
}

const RelationshipsList: React.FC<Props> = ({ id, type }) => {
  const queryKey: QueryKey.Relationships = ['Relationships', type, { id }]

  const {
    status,
    data,
    isFetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(queryKey, relationshipsFetch, {
    getNextPageParam: lastPage => {
      return lastPage.length
        ? {
            direction: 'next',
            id: lastPage[lastPage.length - 1].id
          }
        : undefined
    }
  })
  const flattenData = data?.pages ? data.pages.flatMap(d => [...d]) : []

  const flRef = useRef<FlatList<any>>(null)

  const keyExtractor = useCallback(({ id }) => id, [])
  const renderItem = useCallback(
    ({ item }) => <ComponentAccount account={item} />,
    []
  )
  const flItemEmptyComponent = useMemo(
    () => <TimelineEmpty status={status} refetch={refetch} />,
    [status]
  )
  const onEndReached = useCallback(
    () => !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )
  const ListFooterComponent = useCallback(
    () => <TimelineEnd hasNextPage={hasNextPage} />,
    [hasNextPage]
  )
  const refreshControl = useMemo(
    () => (
      <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />
    ),
    [isFetching]
  )

  useScrollToTop(flRef)

  return (
    <FlatList
      ref={flRef}
      windowSize={11}
      data={flattenData}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      style={styles.flatList}
      renderItem={renderItem}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.75}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={flItemEmptyComponent}
      refreshControl={refreshControl}
      ItemSeparatorComponent={ComponentSeparator}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 2
      }}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default RelationshipsList
