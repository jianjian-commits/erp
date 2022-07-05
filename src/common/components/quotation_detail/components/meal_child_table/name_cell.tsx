import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import { KeyboardTableChildCellOptions } from '../../interface'

const MealBomNameCell: FC<KeyboardTableChildCellOptions> = observer(
  ({ mealIndex, ssuIndex, bomIndex }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.ssu_ingredients?.ssu_ratios![bomIndex]

    return <span>{ssu?.name || '-'}</span>
  },
)

export default MealBomNameCell
