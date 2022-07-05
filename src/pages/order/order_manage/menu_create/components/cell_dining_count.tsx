import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import memoComponentWithDataHoc from './memo'
import { KCInputNumber } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import { isValid, toFixed } from '@/common/util'
import Big from 'big.js'

interface Props {
  index: number
}

const MealSsuPriceCell: FC<Props> = observer(({ index }) => {
  const order = store.orders[index]

  const handleChange = (value: number | null) => {
    const new_value = value === null ? '' : value
    let itemPrice = '0'
    _.forEach(order?.details || [], (de) => {
      itemPrice = toFixed(Big(itemPrice).plus(de?.price || 0))
    })

    store.changeOrderItem(index, {
      dining_count: new_value,
      total_price: isValid(new_value)
        ? toFixed(Big(new_value).times(itemPrice))
        : '-',
    })
  }

  return (
    <KCInputNumber
      precision={0}
      value={
        order?.dining_count === undefined || order?.dining_count === ''
          ? null
          : Number(order?.dining_count)
      }
      onChange={handleChange}
      min={1}
      max={999999999}
      className='form-control input-sm'
      style={{ width: TableXUtil.TABLE_X.WIDTH_NUMBER }}
    />
  )
})

export default memoComponentWithDataHoc(MealSsuPriceCell)
