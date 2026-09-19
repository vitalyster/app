import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectMedia } from '@utils/api/helpers/connect'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video'
import { useEventListener } from 'expo'
import { Platform } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useGlobalStorage } from '@utils/storage/actions'
import StatusContext from '../Context'
import AttachmentAltText from './AltText'
import { aspectRatio } from './dimensions'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  video: Mastodon.AttachmentVideo | Mastodon.AttachmentGifv
  gifv?: boolean
}

const AttachmentVideo: React.FC<Props> = ({
  total,
  index,
  sensitiveShown,
  video,
  gifv = false
}) => {
  const { inThread } = useContext(StatusContext)
  const { colors } = useTheme()
  const { reduceMotionEnabled } = useAccessibility()
  const [shouldAutoplayGifv] = useGlobalStorage.boolean('app.auto_play_gifv')

  const videoRef = useRef<VideoView>(null)
  const [videoLoading, setVideoLoading] = useState(false)

  const player = useVideoPlayer(
    sensitiveShown || !video.url ? null : ({ uri: video.remote_url || video.url } as VideoSource),
    p => {
      p.loop = !gifv
      p.muted = gifv
    }
  )

  useEffect(() => {
    if (sensitiveShown) return
    if (gifv && !reduceMotionEnabled && shouldAutoplayGifv) {
      player.play()
    } else {
      player.pause()
    }
  }, [player, gifv, reduceMotionEnabled, shouldAutoplayGifv, sensitiveShown])

  const playOnPress = useCallback(async () => {
    setVideoLoading(true)
    try {
      if (gifv) {
        player.playing ? player.pause() : player.play()
      } else {
        await videoRef.current?.enterFullscreen()
        Platform.OS === 'android' && (await ScreenOrientation.unlockAsync())
        player.play()
      }
    } catch {
      player.play()
    }
    setVideoLoading(false)
  }, [gifv, player])

  useEventListener(player, 'playToEnd', () => {
    if (gifv) player.replay()
  })

  // Determine content fit (resize mode equivalent)
  const contentFit = Platform.OS === 'android' ? 'contain' : 'cover'
  const posterSource = video.preview_url && !gifv
    ? connectMedia({ uri: video.preview_url })
    : null

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.shimmerDefault,
        aspectRatio: aspectRatio({ total, index, ...video.meta?.original }),
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: StyleConstants.BorderRadius / 2,
        overflow: 'hidden'
      }}
    >
      <VideoView
        ref={videoRef}
        style={{ width: '100%', height: '100%' }}
        player={player}
        contentFit={contentFit}
        nativeControls={!sensitiveShown && !gifv}
        fullscreenOptions={{ enable: !gifv }}
        allowsPictureInPicture={!gifv}
      />

      {/* Overlay for controls and content */}
      <Pressable
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        disabled={gifv ? (sensitiveShown ? true : false) : true}
        onPress={gifv ? playOnPress : null}
      >
        {sensitiveShown ? (
          video.blurhash ? (
            <GracefullyImage
              sources={{ blurhash: video.blurhash }}
              style={{ width: '100%', height: '100%' }}
              dim
              withoutTransition={inThread}
            />
          ) : null
        ) : !gifv || (gifv && (reduceMotionEnabled || !shouldAutoplayGifv)) ? (
          <Button
            round
            overlay
            size='L'
            type='icon'
            content='play-circle'
            onPress={playOnPress}
            loading={videoLoading}
          />
        ) : null}
        <AttachmentAltText sensitiveShown={sensitiveShown} text={video.description} />
      </Pressable>

      {/* GIF label for GIFv videos */}
      {gifv && !shouldAutoplayGifv ? (
        <Button
          style={{
            position: 'absolute',
            left: StyleConstants.Spacing.S,
            bottom: StyleConstants.Spacing.S
          }}
          overlay
          size='S'
          type='text'
          content='GIF'
          fontBold
          onPress={() => {}}
        />
      ) : null}
    </View>
  )
}

export default AttachmentVideo
