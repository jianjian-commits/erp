import React, { FC } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { MoreSelect_MenuPeriodGroup } from 'gm_api/src/merchandise/pc'
import { MoreSelectDataItem } from '@gm-pc/react'

interface Props {
  value: MoreSelectDataItem<string>[]
  onChange: (e: MoreSelectDataItem<string>[]) => void
}

const MealTimeFilter: FC<Props> = (props) => {
  const { value, onChange } = props
  return (
    <MoreSelect_MenuPeriodGroup
      multiple
      getResponseData={(res) =>
        _.map(res.menu_period, ({ menu_period_group }) => ({
          ...menu_period_group,
        }))
      }
      selected={value}
      onSelect={onChange}
      placeholder={t('全部餐次')}
    />
  )
}

export default MealTimeFilter
