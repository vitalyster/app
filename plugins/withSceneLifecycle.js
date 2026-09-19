const { withAppDelegate } = require('expo/config-plugins')

// iOS 27 requires the UIScene lifecycle. ExpoAppSceneDelegate (see UIApplicationSceneManifest in
// app.config.ts) creates the window and starts React Native, so the AppDelegate must provide the
// React Native factory and must not start React Native itself.
module.exports = config =>
  withAppDelegate(config, config => {
    if (config.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle only supports a Swift AppDelegate')
    }

    let contents = config.modResults.contents

    if (!contents.includes('ExpoReactNativeFactoryProvider')) {
      contents = contents.replace(
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      )
    }

    contents = contents.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\n[\s\S]*?startReactNative[\s\S]*?#endif\n/,
      '    // The window is created and React Native started by ExpoAppSceneDelegate (UIScene lifecycle)\n'
    )

    config.modResults.contents = contents
    return config
  })
