import Icon from '@components/Icon'
import RelativeTime from '@components/RelativeTime'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface Props {
  created_at: Mastodon.Status['created_at'] | number
  edited_at?: Mastodon.Status['edited_at']
}

const HeaderSharedCreated = React.memo(
  ({ created_at, edited_at }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return (
      <>
        <CustomText fontStyle='S' style={{ color: colors.secondary }}>
          <RelativeTime date={edited_at || created_at} />
        </CustomText>
        {edited_at ? (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.edited.accessibilityLabel'
            )}
            name='Edit'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={{ marginLeft: StyleConstants.Spacing.S }}
          />
        ) : null}
      </>
    )
  },
  (prev, next) => prev.edited_at === next.edited_at
)

export default HeaderSharedCreated
