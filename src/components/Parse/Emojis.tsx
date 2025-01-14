import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Platform, TextStyle } from 'react-native'
import FastImage from 'react-native-fast-image'

const regexEmoji = new RegExp(/(:[A-Za-z0-9_]+:)/)

export interface Props {
  content?: string
  emojis?: Mastodon.Emoji[]
  size?: 'S' | 'M' | 'L'
  adaptiveSize?: boolean
  fontBold?: boolean
  style?: TextStyle
}

const ParseEmojis: React.FC<Props> = ({
  content,
  emojis,
  size = 'M',
  adaptiveSize = false,
  fontBold = false,
  style
}) => {
  if (!content) return null

  const { reduceMotionEnabled } = useAccessibility()

  const [adaptiveFontsize] = useGlobalStorage.number('app.font_size')
  const adaptedFontsize = adaptiveScale(
    StyleConstants.Font.Size[size],
    adaptiveSize ? adaptiveFontsize : 0
  )
  const adaptedLineheight = adaptiveScale(
    StyleConstants.Font.LineHeight[size],
    adaptiveSize ? adaptiveFontsize : 0
  )

  const { colors, theme } = useTheme()

  return (
    <CustomText
      style={[
        {
          color: colors.primaryDefault,
          fontSize: adaptedFontsize,
          lineHeight: adaptedLineheight
        },
        style
      ]}
      fontWeight={fontBold ? 'Bold' : undefined}
    >
      {emojis ? (
        content
          .split(regexEmoji)
          .filter(f => f)
          .map((str, i) => {
            if (str.match(regexEmoji)) {
              const emojiShortcode = str.split(regexEmoji)[1]
              const emojiIndex = emojis.findIndex(emoji => {
                return emojiShortcode === `:${emoji.shortcode}:`
              })
              if (emojiIndex === -1) {
                return <CustomText key={emojiShortcode + i}>{emojiShortcode}</CustomText>
              } else {
                const uri = reduceMotionEnabled
                  ? emojis[emojiIndex].static_url
                  : emojis[emojiIndex].url
                return (
                  <CustomText key={emojiShortcode + i}>
                    {i === 0 ? ' ' : undefined}
                    <FastImage
                      source={{ uri: uri.trim() }}
                      style={{
                        width: adaptedFontsize,
                        height: adaptedFontsize,
                        transform: [{ translateY: Platform.OS === 'ios' ? -1 : 2 }]
                      }}
                    />
                  </CustomText>
                )
              }
            } else {
              return <CustomText key={i}>{str}</CustomText>
            }
          })
      ) : (
        <CustomText>{content}</CustomText>
      )}
    </CustomText>
  )
}

export default ParseEmojis
