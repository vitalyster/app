import React from 'react'
import { StyleSheet, Text } from 'react-native'
import HTMLView, { HTMLViewNode } from 'react-native-htmlview'
import { useNavigation } from '@react-navigation/native'

import Emojis from 'src/components/Toot/Emojis'

const renderNode = ({
  node,
  index,
  navigation,
  mentions,
  showFullLink
}: {
  node: HTMLViewNode
  index: number
  navigation: object
  mentions?: mastodon.Mention[]
  showFullLink: boolean
}) => {
  if (node.name == 'a') {
    const classes = node.attribs.class
    const href = node.attribs.href
    if (classes) {
      if (classes.includes('hashtag')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const tag = href.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
              navigation.navigate('Hashtag', {
                hashtag: tag[1] || tag[2]
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      } else if (classes.includes('mention')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const username = href.split(new RegExp(/@(.*)/))
              const usernameIndex = mentions.findIndex(
                m => m.username === username[1]
              )
              navigation.navigate('Account', {
                id: mentions[usernameIndex].id
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      }
    } else {
      const domain = href.split(new RegExp(/:\/\/(.*?)\//))
      return (
        <Text
          key={index}
          style={styles.a}
          onPress={() => {
            navigation.navigate('Webview', {
              uri: href,
              domain: domain[1]
            })
          }}
        >
          {showFullLink ? href : domain[1]}
        </Text>
      )
    }
  }
}

export interface Props {
  content: string
  emojis?: mastodon.Emoji[]
  emojiSize?: number
  mentions?: mastodon.Mention[]
  showFullLink?: boolean
  linesTruncated?: number
}

const ParseContent: React.FC<Props> = ({
  content,
  emojis,
  emojiSize = 14,
  mentions,
  showFullLink = false,
  linesTruncated = 10
}) => {
  const navigation = useNavigation()

  return (
    <HTMLView
      value={content}
      stylesheet={HTMLstyles}
      paragraphBreak=''
      renderNode={(node, index) =>
        renderNode({ node, index, navigation, mentions, showFullLink })
      }
      TextComponent={({ children }) =>
        emojis ? (
          <Emojis content={children} emojis={emojis} dimension={emojiSize} />
        ) : (
          <Text>{children}</Text>
        )
      }
      RootComponent={({ children }) => {
        return <Text numberOfLines={linesTruncated}>{children}</Text>
      }}
    />
  )
}

const styles = StyleSheet.create({
  a: {
    color: 'blue'
  }
})

const HTMLstyles = StyleSheet.create({
  p: {
    marginBottom: 12
  }
})

export default ParseContent