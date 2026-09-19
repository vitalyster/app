const { withPodfile } = require('expo/config-plugins')

const MARKER = '# [tooot] raise pods deployment target'

// Some pods (e.g. react-native-ios-context-menu uses UIMenuElement.subtitle, iOS 16+) ship with a
// lower deployment target than the app. Build every pod for at least the app's target.
module.exports = (config, { deploymentTarget = '16.4' } = {}) =>
  withPodfile(config, config => {
    if (config.modResults.contents.includes(MARKER)) {
      return config
    }

    config.modResults.contents = config.modResults.contents.replace(
      /(react_native_post_install\([\s\S]*?\n    \)\n)/,
      `$1
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        if build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${deploymentTarget}
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'
        end
      end
    end
`
    )
    return config
  })
