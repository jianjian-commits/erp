import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import memoComponentWithDataHoc from './memo_hoc'
import { KeyboardTableChildCellOptions } from '../../interface'
import { Flex, Price } from '@gm-pc/react'
import { isValid, toFixed } from '@/common/util'
import Big from 'big.js'
import globalStore from '@/stores/global'

import { Ssu_ShippingFeeUnit } from 'gm_api/src/merchandise'

const MealSsuPriceCell: FC<KeyboardTableChildCellOptions> = observer(
  ({ ssuIndex, mealIndex, bomIndex }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.ssu_ingredients?.ssu_ratios[bomIndex]

    // 这里单位根据计价单位展示，与商品详情中保持一致
    const ssu_name =
      ssu?.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
        ? ssu?.unit?.name
        : globalStore.getUnitName(ssu?.unit?.parent_id!)

    return (
      <Flex alignCenter>
        {isValid(ssu?.default_price)
          ? Big(ssu?.default_price!).toFixed(2)
          : '-'}
        <span className='gm-padding-5'>
          {Price.getUnit() + '/'}
          {ssu_name || '-'}
        </span>
      </Flex>
    )
  },
)

export default memoComponentWithDataHoc(MealSsuPriceCell)
