import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import _ from 'lodash'
import memoComponentWithDataHoc from './memo_hoc'
import { KeyboardTableCellOptions } from './interface'
import { Select } from '@gm-pc/react'
import globalStore from '@/stores/global'

const MealSkuUnitCell: FC<KeyboardTableCellOptions> = observer(
  ({ mealIndex, skuIndex }) => {
    const sku = _.get(
      store.editMenu,
      `periodInfos[${mealIndex}].detail_skus[${skuIndex}]`,
    )
    const unit_id = _.get(sku, 'unit_id', '')

    const findUnit = (id: string) => {
      return _.find(globalStore.unitList, (unitItem) => unitItem.value === id)
    }

    // 初始化单位选项列表
    const initSelectList = () => {
      const data = []
      // 基本单位
      const base_unit_id = _.get(sku, 'sku.base_unit_id')
      if (base_unit_id && base_unit_id !== '0') {
        const baseUnit = {
          text: findUnit(base_unit_id)?.name || '',
          value: base_unit_id,
        }
        data.push(baseUnit)
      }

      // 辅助单位
      const second_base_unit_id = _.get(sku, 'sku.second_base_unit_id')
      if (second_base_unit_id && second_base_unit_id !== '0') {
        const secondBaseUnit = {
          text: findUnit(second_base_unit_id)?.name || '',
          value: second_base_unit_id,
        }
        data.push(secondBaseUnit)
      }

      // 自定义单位
      const units = _.get(sku, 'sku.units.units', []).map((unit: any) => {
        return {
          text: unit.name,
          value: unit.unit_id,
        }
      })
      data.push(...units)

      return data
    }

    const data = initSelectList()

    return (
      <Select
        value={unit_id}
        data={data}
        onChange={(value) => {
          const obj = {
            ...sku,
            unit_id: value,
          }
          store.changeMealItemName(mealIndex, skuIndex, obj)
        }}
      />
    )
  },
)

export default memoComponentWithDataHoc(MealSkuUnitCell)
