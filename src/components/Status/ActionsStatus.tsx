import React, { useEffect, useState } from 'react'
import {
  ActionSheetIOS,
  Clipboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'
import { useMutation, useQueryCache } from 'react-query'
import { useSelector } from 'react-redux'
import { Feather } from '@expo/vector-icons'

import client from 'src/api/client'

const fireMutation = async ({
  id,
  type,
  stateKey,
  prevState
}: {
  id: string
  type:
    | 'favourite'
    | 'reblog'
    | 'bookmark'
    | 'mute'
    | 'pin'
    | 'delete'
    | 'account/mute'
  stateKey:
    | 'favourited'
    | 'reblogged'
    | 'bookmarked'
    | 'muted'
    | 'pinned'
    | 'id'
  prevState?: boolean
}) => {
  let res
  switch (type) {
    case 'favourite':
    case 'reblog':
    case 'bookmark':
    case 'mute':
    case 'pin':
      res = await client({
        method: 'post',
        instance: 'local',
        endpoint: `statuses/${id}/${prevState ? 'un' : ''}${type}`
      })

      if (!res.body[stateKey] === prevState) {
        if (type === 'bookmark' || 'mute' || 'pin')
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '功能成功',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 65
          })
        return Promise.resolve(res.body)
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: '请重试',
          autoHide: false,
          bottomOffset: 65
        })
        return Promise.reject()
      }
      break
    case 'delete':
      res = await client({
        method: 'delete',
        instance: 'local',
        endpoint: `statuses/${id}`
      })

      if (res.body[stateKey] === id) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: '删除成功',
          visibilityTime: 2000,
          autoHide: true,
          bottomOffset: 65
        })
        return Promise.resolve(res.body)
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: '请重试',
          autoHide: false,
          bottomOffset: 65
        })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey: store.QueryKey
  status: mastodon.Status
}

const ActionsStatus: React.FC<Props> = ({ queryKey, status }) => {
  const localAccountId = useSelector(state => state.instanceInfo.localAccountId)
  const [modalVisible, setModalVisible] = useState(false)

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: () => {
      queryCache.cancelQueries(queryKey)
      const prevData = queryCache.getQueryData(queryKey)
      return prevData
    },
    onSuccess: (newData, params) => {
      if (params.type === 'reblog') {
        queryCache.invalidateQueries(['Following', { page: 'Following' }])
      }
      // queryCache.setQueryData(queryKey, (oldData: any) => {
      //   oldData &&
      //     oldData.map((paging: any) => {
      //       paging.toots.map(
      //         (status: mastodon.Status | mastodon.Notification, i: number) => {
      //           if (status.id === newData.id) {
      //             paging.toots[i] = newData
      //           }
      //         }
      //       )
      //     })
      //   return oldData
      // })
      return Promise.resolve()
    },
    onError: (err, variables, prevData) => {
      queryCache.setQueryData(queryKey, prevData)
    },
    onSettled: () => {
      queryCache.invalidateQueries(queryKey)
    }
  })

  return (
    <>
      <View style={styles.actions}>
        <Pressable style={styles.action}>
          <Feather name='message-circle' color='gray' />
          {status.replies_count > 0 && <Text>{status.replies_count}</Text>}
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id: status.id,
              type: 'reblog',
              stateKey: 'reblogged',
              prevState: status.reblogged
            })
          }
        >
          <Feather name='repeat' color={status.reblogged ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id: status.id,
              type: 'favourite',
              stateKey: 'favourited',
              prevState: status.favourited
            })
          }
        >
          <Feather name='heart' color={status.favourited ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id: status.id,
              type: 'bookmark',
              stateKey: 'bookmarked',
              prevState: status.bookmarked
            })
          }
        >
          <Feather
            name='bookmark'
            color={status.bookmarked ? 'black' : 'gray'}
          />
        </Pressable>

        <Pressable style={styles.action} onPress={() => setModalVisible(true)}>
          <Feather name='more-horizontal' color='gray' />
        </Pressable>
      </View>

      <Modal
        animationType='fade'
        presentationStyle='overFullScreen'
        transparent
        visible={modalVisible}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Pressable
              onPress={() =>
                ActionSheetIOS.showShareActionSheetWithOptions(
                  {
                    url: status.uri,
                    excludedActivityTypes: [
                      'com.apple.UIKit.activity.Mail',
                      'com.apple.UIKit.activity.Print',
                      'com.apple.UIKit.activity.SaveToCameraRoll',
                      'com.apple.UIKit.activity.OpenInIBooks'
                    ]
                  },
                  () => {},
                  () => {
                    setModalVisible(false)
                    Toast.show({
                      type: 'success',
                      position: 'bottom',
                      text1: '分享成功',
                      visibilityTime: 2000,
                      autoHide: true,
                      bottomOffset: 65
                    })
                  }
                )
              }
            >
              <Text>分享</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Clipboard.setString(status.uri)
                setModalVisible(false)
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: '链接复制成功',
                  visibilityTime: 2000,
                  autoHide: true,
                  bottomOffset: 65
                })
              }}
            >
              <Text>复制链接</Text>
            </Pressable>
            {status.account.id === localAccountId && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: status.id,
                    type: 'delete',
                    stateKey: 'id'
                  })
                }}
              >
                <Text>删除</Text>
              </Pressable>
            )}
            <Text>（删除并重发）</Text>
            <Pressable
              onPress={() => {
                setModalVisible(false)
                mutateAction({
                  id: status.id,
                  type: 'mute',
                  stateKey: 'muted',
                  prevState: status.muted
                })
              }}
            >
              <Text>{status.muted ? '取消静音' : '静音'}</Text>
            </Pressable>
            {status.account.id === localAccountId && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: status.id,
                    type: 'pin',
                    stateKey: 'pinned',
                    prevState: status.pinned
                  })
                }}
              >
                <Text>{status.pinned ? '取消置顶' : '置顶'}</Text>
              </Pressable>
            )}
            <Text>静音用户，屏蔽用户，屏蔽域名，举报用户</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: 8
  },
  action: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  modalSheet: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    flex: 1
  }
})

export default ActionsStatus
