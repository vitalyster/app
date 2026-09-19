const { getDefaultConfig } = require('expo/metro-config')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname)

module.exports = wrapWithReanimatedMetroConfig(config)
