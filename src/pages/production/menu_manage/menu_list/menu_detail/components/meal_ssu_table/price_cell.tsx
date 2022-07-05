import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import memoComponentWithDataHoc from './memo_hoc'
import { KCInputNumber } from '@gm-pc/keyboard'
import { keyboardTableCellOptions } from '../../interface'
import { Flex, Price } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'

const { TABLE_X } = TableXUtil

const MealSsuPriceCell: FC<keyboardTableCellOptions> = observer(
  ({ ssuIndex, mealIndex, editStatus }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]

    const handlePriceChange = (value: number | null) => {
      const new_value = value === null ? '' : value
      store.changeMealItemPrice(mealIndex, ssuIndex, {
        price: new_value,
      })
    }

    return (
      <Flex alignCenter>
        <KCInputNumber
          value={ssu?.base_price?.price}
          onChange={handlePriceChange}
          min={0}
          precision={4}
          disabled={!editStatus?.canEditSsu}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
        <span className='gm-padding-5'>
          {Price.getUnit() + '/'}
          {ssu?.unit?.name || '-'}
        </span>
      </Flex>
    )
  },
)

export default memoComponentWithDataHoc(MealSsuPriceCell)
