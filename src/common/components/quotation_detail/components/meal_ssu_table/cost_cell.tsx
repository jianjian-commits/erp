import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import memoComponentWithDataHoc from './memo_hoc'
import { KeyboardTableCellOptions } from '../../interface'
import { Flex, Price } from '@gm-pc/react'
import Big from 'big.js'
import globalStore from '@/stores/global'
import { Ssu_Ingredients, Ssu_Type, UnitValue } from 'gm_api/src/merchandise'
import { parseSsu } from '@/common/util'

const MealSsuCostCell: FC<KeyboardTableCellOptions> = observer(
  ({ ssuIndex, mealIndex }) => {
    const periodInfo = store.editMenu?.details?.service_period_infos[mealIndex]
    const ssu = periodInfo?.details[ssuIndex]
    let price
    const unitVal = store.reference.getUnitReferencePrice(ssu) as UnitValue
    const unitName =
      globalStore.getUnitName(unitVal.unit_id) || parseSsu(ssu).ssu_unit_name
    price = Big(unitVal.val || 0).toFixed(2)
    price = +price ? `${price}${Price.getUnit()}/${unitName}` : '-'

    if (ssu.type === Ssu_Type.TYPE_COMBINE) {
      const { val: total = '0' } =
        store.reference.calcCombinedSsuReferencePrice(
          ssu.ssu_ingredients as Ssu_Ingredients,
        )
      const val = Big(total || 0).toFixed(2)
      price = +val ? `${val}${Price.getUnit()}/${unitName}` : '-'
    }

    return <Flex alignCenter>{price}</Flex>
  },
)

export default memoComponentWithDataHoc(MealSsuCostCell)
