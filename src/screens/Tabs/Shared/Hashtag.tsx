import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { displayMessage } from '@components/Message'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { useQueryClient } from '@tanstack/react-query'
import { featureCheck } from '@utils/helpers/featureCheck'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyFollowedTags, useTagsMutation, useTagsQuery } from '@utils/queryHooks/tags'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabSharedHashtag: React.FC<TabSharedStackScreenProps<'Tab-Shared-Hashtag'>> = ({
  navigation,
  route: {
    params: { hashtag }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Hashtag', hashtag }]

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
      title: `#${decodeURIComponent(hashtag)}`
    })
    navigation.setParams({ queryKey: queryKey })
  }, [])

  const { t } = useTranslation(['common', 'screenTabs'])

  const canFollowTags = featureCheck('follow_tags')
  const { data, isFetching, refetch } = useTagsQuery({
    tag: hashtag,
    options: { enabled: canFollowTags }
  })
  const queryClient = useQueryClient()
  const mutation = useTagsMutation({
    onSuccess: () => {
      haptics('Success')
      refetch()
      const queryKeyFollowedTags: QueryKeyFollowedTags = ['FollowedTags']
      queryClient.invalidateQueries({ queryKey: queryKeyFollowedTags })
    },
    onError: (err: any, { to }) => {
      displayMessage({
        type: 'error',
        message: t('common:message.error.message', {
          function: to
            ? t('screenTabs:shared.hashtag.follow')
            : t('screenTabs:shared.hashtag.unfollow')
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
      })
    }
  })
  useEffect(() => {
    if (!canFollowTags) return

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          loading={isFetching || mutation.isLoading}
          type='text'
          content={
            data?.following
              ? t('screenTabs:shared.hashtag.unfollow')
              : t('screenTabs:shared.hashtag.follow')
          }
          onPress={() =>
            typeof data?.following === 'boolean' &&
            mutation.mutate({ tag: hashtag, to: !data.following })
          }
        />
      )
    })
  }, [canFollowTags, data?.following, isFetching])

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

export default TabSharedHashtag
