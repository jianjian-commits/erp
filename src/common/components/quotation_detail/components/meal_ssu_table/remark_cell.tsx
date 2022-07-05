import React, { ChangeEvent, FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import { KCInput } from '@gm-pc/keyboard'
import { KeyboardTableCellOptions } from '../../interface'

const MealSsuPriceCell: FC<KeyboardTableCellOptions> = observer(
  ({ ssuIndex, mealIndex, editStatus }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      store.changeMealSsu(mealIndex, ssuIndex, {
        remark: event.target.value,
      })
    }

    return (
      <KCInput
        value={ssu?.remark}
        onChange={handleInputChange}
        min={0}
        disabled={!editStatus?.canEditSsu}
        className='form-control input-sm'
      />
    )
  },
)

export default MealSsuPriceCell
