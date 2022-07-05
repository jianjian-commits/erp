import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { KeyboardTableChildCellOptions } from '../../interface'

const MealBomRateCell: FC<KeyboardTableChildCellOptions> = observer(
  ({ mealIndex, ssuIndex, bomIndex }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.ssu_ingredients?.ssu_ratios[bomIndex]

    return (
      <Flex alignCenter>
        {ssu?.unit?.rate}
        {globalStore.getUnitName(ssu?.unit?.parent_id)}/{ssu?.unit?.name}
      </Flex>
    )
  },
)

export default MealBomRateCell
