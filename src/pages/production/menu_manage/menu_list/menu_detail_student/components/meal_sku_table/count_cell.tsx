import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import memoComponentWithDataHoc from './memo_hoc'
import { KeyboardTableCellOptions } from './interface'
import { InputNumber } from '@gm-pc/react'
import _ from 'lodash'

const MealSkuCountCell: FC<KeyboardTableCellOptions> = observer(
  ({ mealIndex, skuIndex }) => {
    const sku = _.get(
      store.editMenu,
      `periodInfos[${mealIndex}].detail_skus[${skuIndex}]`,
    )
    const { count } = sku

    return (
      <InputNumber
        value={count}
        min={0}
        max={999999999}
        precision={4}
        onChange={(value: number) => {
          const obj = {
            ...sku,
            count: value,
          }
          store.changeMealItemName(mealIndex, skuIndex, obj)
        }}
      />
    )
  },
)

export default memoComponentWithDataHoc(MealSkuCountCell)
