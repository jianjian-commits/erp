import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import memoComponentWithDataHoc from './memo_hoc'
import { KeyboardTableChildCellOptions } from '../../interface'
import { Flex, Price } from '@gm-pc/react'
import Big from 'big.js'
import { Ssu_Ingredients_SsuRatio, UnitValue } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'

const MealSsuCostCell: FC<KeyboardTableChildCellOptions> = observer(
  ({ ssuIndex, mealIndex, bomIndex }) => {
    const ssu =
      store.editMenu.details.service_period_infos?.[mealIndex]?.details?.[
        ssuIndex
      ]?.ssu_ingredients?.ssu_ratios?.[bomIndex]

    const { val, unit_id } = store.reference.getUnitReferencePrice(
      ssu as Ssu_Ingredients_SsuRatio,
    ) as UnitValue
    const price = Big(val || 0).toFixed(2)
    const unitName = globalStore.getUnitName(unit_id)
    return (
      <Flex alignCenter>
        {+price ? `${price}${Price.getUnit()}/${unitName}` : '-'}
      </Flex>
    )
  },
)

export default memoComponentWithDataHoc(MealSsuCostCell)
