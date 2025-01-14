import haptics from '@components/haptics'
import {
  MutationOptions,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation
} from '@tanstack/react-query'
import { PagedResponse } from '@utils/api/helpers'
import apiInstance from '@utils/api/instance'
import { featureCheck } from '@utils/helpers/featureCheck'
import { useNavState } from '@utils/navigation/navigators'
import { queryClient } from '@utils/queryHooks'
import { getAccountStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'
import { uniqBy } from 'lodash'
import { searchLocalStatus } from './search'
import deleteItem from './timeline/deleteItem'
import updateStatusProperty from './timeline/updateStatusProperty'

export type QueryKeyTimeline = [
  'Timeline',
  (
    | {
        page: Exclude<App.Pages, 'Following' | 'Hashtag' | 'List' | 'Toot' | 'Account'>
      }
    | {
        page: 'Following'
        showBoosts: boolean
        showReplies: boolean
      }
    | {
        page: 'Hashtag'
        hashtag: Mastodon.Tag['name']
      }
    | {
        page: 'List'
        list: Mastodon.List['id']
      }
    | {
        page: 'Account'
        id?: Mastodon.Account['id']
        exclude_reblogs: boolean
        only_media: boolean
      }
    | {
        page: 'Toot'
        toot: Mastodon.Status['id']
        remote: boolean
      }
  )
]

const queryFunction = async ({ queryKey, pageParam }: QueryFunctionContext<QueryKeyTimeline>) => {
  const page = queryKey[1]
  let params: { [key: string]: string } = { limit: 40, ...pageParam }

  switch (page.page) {
    case 'Following':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/home',
        params
      }).then(res => {
        if (!page.showBoosts || !page.showReplies) {
          return {
            ...res,
            body: res.body
              .filter(status => {
                if (!page.showBoosts && status.reblog) {
                  return null
                }
                if (!page.showReplies && status.in_reply_to_id?.length) {
                  return null
                }

                return status
              })
              .filter(s => s)
          }
        } else {
          return res
        }
      })

    case 'Local':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/public',
        params: {
          ...params,
          local: 'true'
        }
      })

    case 'LocalPublic':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'timelines/public',
        params
      })

    case 'Trending':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: 'trends/statuses',
        params
      })

    case 'Notifications':
      const notificationsFilter = getAccountStorage.object('notifications')
      const usePositiveFilter = featureCheck('notification_types_positive_filter')
      return apiInstance<Mastodon.Notification[]>({
        method: 'get',
        url: 'notifications',
        params: {
          ...params,
          ...(notificationsFilter &&
            (usePositiveFilter
              ? {
                  types: Object.keys(notificationsFilter)
                    // @ts-ignore
                    .filter(filter => notificationsFilter[filter] === true)
                }
              : {
                  exclude_types: Object.keys(notificationsFilter)
                    // @ts-ignore
                    .filter(filter => notificationsFilter[filter] === false)
                }))
        }
      })

    case 'Account':
      if (!page.id) return Promise.reject('Timeline query account id not provided')

      if (page.exclude_reblogs) {
        if (pageParam && pageParam.hasOwnProperty('max_id')) {
          return apiInstance<Mastodon.Status[]>({
            method: 'get',
            url: `accounts/${page.id}/statuses`,
            params: {
              exclude_replies: 'true',
              ...params
            }
          })
        } else {
          const res1 = await apiInstance<(Mastodon.Status & { _pinned: boolean })[]>({
            method: 'get',
            url: `accounts/${page.id}/statuses`,
            params: {
              pinned: 'true'
            }
          })
          res1.body = res1.body.map(status => {
            status._pinned = true
            return status
          })
          const res2 = await apiInstance<Mastodon.Status[]>({
            method: 'get',
            url: `accounts/${page.id}/statuses`,
            params: {
              exclude_replies: 'true'
            }
          })
          return {
            body: uniqBy([...res1.body, ...res2.body], 'id'),
            ...(res2.links.next && { links: { next: res2.links.next } })
          }
        }
      } else {
        return apiInstance<Mastodon.Status[]>({
          method: 'get',
          url: `accounts/${page.id}/statuses`,
          params: {
            ...params,
            exclude_replies: page.exclude_reblogs.toString(),
            only_media: page.only_media.toString()
          }
        })
      }

    case 'Hashtag':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `timelines/tag/${page.hashtag}`,
        params
      })

    case 'Conversations':
      return apiInstance<Mastodon.Conversation[]>({
        method: 'get',
        url: `conversations`,
        params
      })

    case 'Bookmarks':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `bookmarks`,
        params
      })

    case 'Favourites':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `favourites`,
        params
      })

    case 'List':
      return apiInstance<Mastodon.Status[]>({
        method: 'get',
        url: `timelines/list/${page.list}`,
        params
      })
    default:
      return Promise.reject('Timeline query no page matched')
  }
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type TimelineData = Unpromise<ReturnType<typeof queryFunction>>
const useTimelineQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTimeline[1] & {
  options?: UseInfiniteQueryOptions<PagedResponse<Mastodon.Status[]>, AxiosError>
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    ...options
  })
}

// --- Separator ---

enum MapPropertyToUrl {
  bookmarked = 'bookmark',
  favourited = 'favourite',
  muted = 'mute',
  pinned = 'pin',
  reblogged = 'reblog'
}

export type MutationVarsTimelineUpdateStatusProperty = {
  // This is status in general, including "status" inside conversation and notification
  type: 'updateStatusProperty'
  status: Mastodon.Status
  payload:
    | {
        type: 'bookmarked' | 'muted' | 'pinned'
        to: boolean
      }
    | {
        type: 'favourited'
        to: boolean
      }
    | {
        type: 'reblogged'
        visibility: 'public' | 'unlisted'
        to: boolean
      }
    | {
        type: 'poll'
        action: 'vote'
        options: boolean[]
      }
    | {
        type: 'poll'
        action: 'refresh'
      }
}

export type MutationVarsTimelineUpdateAccountProperty = {
  // This is status in general, including "status" inside conversation and notification
  type: 'updateAccountProperty'
  id: Mastodon.Account['id']
  payload: {
    property: 'mute' | 'block' | 'reports'
    currentValue?: boolean
  }
}

export type MutationVarsTimelineDeleteItem = {
  // This is for deleting status and conversation
  type: 'deleteItem'
  source: 'statuses' | 'conversations'
  id: Mastodon.Status['id']
}

export type MutationVarsTimelineDomainBlock = {
  // This is for deleting status and conversation
  type: 'domainBlock'
  domain: string
}

export type MutationVarsTimeline =
  | MutationVarsTimelineUpdateStatusProperty
  | MutationVarsTimelineUpdateAccountProperty
  | MutationVarsTimelineDeleteItem
  | MutationVarsTimelineDomainBlock

const mutationFunction = async (params: MutationVarsTimeline) => {
  switch (params.type) {
    case 'updateStatusProperty':
      switch (params.payload.type) {
        case 'poll':
          const formData = new FormData()
          params.payload.action === 'vote' &&
            params.payload.options?.forEach((option, index) => {
              if (option) {
                formData.append('choices[]', index.toString())
              }
            })

          return apiInstance<Mastodon.Poll>({
            method: params.payload.action === 'vote' ? 'post' : 'get',
            url:
              params.payload.action === 'vote'
                ? `polls/${params.status.poll?.id}/votes`
                : `polls/${params.status.poll?.id}`,
            ...(params.payload.action === 'vote' && { body: formData })
          })
        default:
          let tootId = params.status.id
          if (params.status._remote) {
            const fetched = await searchLocalStatus(params.status.uri)
            if (fetched) {
              tootId = fetched.id
            } else {
              return Promise.reject('Fetching for remote toot failed')
            }
          }
          const body = new FormData()
          if (params.payload.type === 'reblogged') {
            body.append('visibility', params.payload.visibility)
          }
          return apiInstance<Mastodon.Status>({
            method: 'post',
            url: `statuses/${tootId}/${params.payload.to ? '' : 'un'}${
              MapPropertyToUrl[params.payload.type]
            }`,
            ...(params.payload.type === 'reblogged' && { body })
          })
      }
    case 'updateAccountProperty':
      switch (params.payload.property) {
        case 'block':
        case 'mute':
          return apiInstance<Mastodon.Account>({
            method: 'post',
            url: `accounts/${params.id}/${params.payload.currentValue ? 'un' : ''}${
              params.payload.property
            }`
          })
        case 'reports':
          return apiInstance<Mastodon.Account>({
            method: 'post',
            url: `reports`,
            params: {
              account_id: params.id
            }
          })
      }
    case 'deleteItem':
      return apiInstance<Mastodon.Conversation>({
        method: 'delete',
        url: `${params.source}/${params.id}`
      })
    case 'domainBlock':
      return apiInstance<any>({
        method: 'post',
        url: `domain_blocks`,
        params: {
          domain: params.domain
        }
      })
  }
}

type MutationOptionsTimeline = MutationOptions<
  { body: Mastodon.Conversation | Mastodon.Notification | Mastodon.Status },
  AxiosError,
  MutationVarsTimeline
>

const useTimelineMutation = ({
  onError,
  onMutate,
  onSettled,
  onSuccess
}: {
  onError?: MutationOptionsTimeline['onError']
  onMutate?: boolean
  onSettled?: MutationOptionsTimeline['onSettled']
  onSuccess?: MutationOptionsTimeline['onSuccess']
}) => {
  const navigationState = useNavState()

  return useMutation<
    { body: Mastodon.Conversation | Mastodon.Notification | Mastodon.Status },
    AxiosError,
    MutationVarsTimeline
  >(mutationFunction, {
    onError,
    onSettled,
    onSuccess,
    ...(onMutate && {
      onMutate: params => {
        queryClient.cancelQueries(navigationState[0])
        const oldData = navigationState[0] && queryClient.getQueryData(navigationState[0])

        haptics('Light')
        switch (params.type) {
          case 'updateStatusProperty':
            updateStatusProperty(params, navigationState)
            break
          case 'deleteItem':
            deleteItem(params, navigationState)
            break
        }
        return oldData
      }
    })
  })
}

export { useTimelineQuery, useTimelineMutation }
