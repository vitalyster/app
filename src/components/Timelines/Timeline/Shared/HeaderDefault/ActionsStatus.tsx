import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Alert } from 'react-native'
import { useMutation, useQueryCache } from 'react-query'
import client from 'src/api/client'
import { MenuContainer, MenuHeader, MenuRow } from 'src/components/Menu'
import { toast } from 'src/components/toast'
import getCurrentTab from 'src/utils/getCurrentTab'

const fireMutation = async ({
  id,
  type,
  stateKey,
  prevState
}: {
  id: string
  type: 'mute' | 'pin' | 'delete'
  stateKey: 'muted' | 'pinned' | 'id'
  prevState?: boolean
}) => {
  let res
  switch (type) {
    case 'mute':
    case 'pin':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `statuses/${id}/${prevState ? 'un' : ''}${type}`
      }) // bug in response from Mastodon

      if (!res.body[stateKey] === prevState) {
        toast({ type: 'success', content: '功能成功' })
        return Promise.resolve(res.body)
      } else {
        toast({ type: 'error', content: '功能错误' })
        return Promise.reject()
      }
      break
    case 'delete':
      res = await client({
        method: 'delete',
        instance: 'local',
        url: `statuses/${id}`
      })

      if (res.body[stateKey] === id) {
        toast({ type: 'success', content: '删除成功' })
        return Promise.resolve(res.body)
      } else {
        toast({ type: 'error', content: '删除失败' })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey: App.QueryKey
  status: Mastodon.Status
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsStatus: React.FC<Props> = ({
  queryKey,
  status,
  setBottomSheetVisible
}) => {
  const navigation = useNavigation()
  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: ({ id, type, stateKey, prevState }) => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)

      switch (type) {
        case 'mute':
        case 'pin':
          queryCache.setQueryData(queryKey, old =>
            (old as {}[]).map((paging: any) => ({
              toots: paging.toots.map((toot: any) => {
                if (toot.id === id) {
                  toot[stateKey] =
                    typeof prevState === 'boolean' ? !prevState : true
                }
                return toot
              }),
              pointer: paging.pointer
            }))
          )
          break
        case 'delete':
          queryCache.setQueryData(queryKey, old =>
            (old as {}[]).map((paging: any) => ({
              toots: paging.toots.filter((toot: any) => toot.id !== id),
              pointer: paging.pointer
            }))
          )
          break
      }

      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试' })
      queryCache.setQueryData(queryKey, oldData)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading='关于嘟嘟' />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({
            type: 'delete',
            id: status.id,
            stateKey: 'id'
          })
        }}
        iconFront='trash'
        title='删除嘟嘟'
      />
      <MenuRow
        onPress={() => {
          Alert.alert(
            '确认删除嘟嘟？',
            '你确定要删除这条嘟文并重新编辑它吗？所有相关的转嘟和喜欢都会被清除，回复将会失去关联。',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '删除并重新编辑',
                style: 'destructive',
                onPress: async () => {
                  await client({
                    method: 'delete',
                    instance: 'local',
                    url: `statuses/${status.id}`
                  })
                    .then(res => {
                      queryCache.invalidateQueries(queryKey)
                      setBottomSheetVisible(false)
                      navigation.navigate(getCurrentTab(navigation), {
                        screen: 'Screen-Shared-Compose',
                        params: { type: 'edit', incomingStatus: res.body }
                      })
                    })
                    .catch(() => {
                      toast({ type: 'error', content: '删除失败' })
                    })
                }
              }
            ]
          )
        }}
        iconFront='trash'
        title='删除并重新编辑'
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({
            type: 'mute',
            id: status.id,
            stateKey: 'muted',
            prevState: status.muted
          })
        }}
        iconFront='volume-x'
        title={status.muted ? '取消隐藏对话' : '隐藏对话'}
      />
      {/* Also note that reblogs cannot be pinned. */}
      {(status.visibility === 'public' || status.visibility === 'unlisted') && (
        <MenuRow
          onPress={() => {
            setBottomSheetVisible(false)
            mutateAction({
              type: 'pin',
              id: status.id,
              stateKey: 'pinned',
              prevState: status.pinned
            })
          }}
          iconFront='anchor'
          title={status.pinned ? '取消置顶' : '置顶'}
        />
      )}
    </MenuContainer>
  )
}

export default HeaderDefaultActionsStatus