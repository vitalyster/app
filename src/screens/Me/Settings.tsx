import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS, StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { MenuContainer, MenuItem } from 'src/components/Menu'
import {
  changeLanguage,
  changeTheme,
  getSettingsLanguage,
  getSettingsTheme
} from 'src/utils/slices/settingsSlice'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

const ScreenMeSettings: React.FC = () => {
  const { t, i18n } = useTranslation('meSettings')
  const { setTheme, theme } = useTheme()
  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const dispatch = useDispatch()

  return (
    <>
      <MenuContainer marginTop={true}>
        <MenuItem
          title={t('content.language.heading')}
          content={t(`content.language.options.${settingsLanguage}`)}
          iconBack='chevron-right'
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: [
                  t('content.language.options.zh'),
                  t('content.language.options.en'),
                  t('content.language.options.cancel')
                ],
                cancelButtonIndex: 2
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    dispatch(changeLanguage('zh'))
                    i18n.changeLanguage('zh')
                    break
                  case 1:
                    dispatch(changeLanguage('en'))
                    i18n.changeLanguage('en')
                    break
                }
              }
            )
          }
        />
        <MenuItem
          title={t('content.theme.heading')}
          content={t(`content.theme.options.${settingsTheme}`)}
          iconBack='chevron-right'
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: [
                  t('content.theme.options.auto'),
                  t('content.theme.options.light'),
                  t('content.theme.options.dark'),
                  t('content.theme.options.cancel')
                ],
                cancelButtonIndex: 3
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    dispatch(changeTheme('auto'))
                    break
                  case 1:
                    dispatch(changeTheme('light'))
                    setTheme('light')
                    break
                  case 2:
                    dispatch(changeTheme('dark'))
                    setTheme('dark')
                    break
                }
              }
            )
          }
        />
      </MenuContainer>
      <MenuContainer>
        <MenuItem
          title={t('content.copyrights.heading')}
          iconBack='chevron-right'
        ></MenuItem>
        <Text style={[styles.version, { color: theme.secondary }]}>
          {t('content.version', { version: '1.0.0' })}
        </Text>
      </MenuContainer>
    </>
  )
}

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
    fontSize: StyleConstants.Font.Size.S,
    marginTop: StyleConstants.Spacing.M
  }
})

export default ScreenMeSettings
