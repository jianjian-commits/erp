import { getMaterialRateCostV2 } from '@/pages/production/util'
import { KCInputNumber } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useRef, useState } from 'react'
import { MaterialItem } from '../interface'
import store from '../store'

/**
 * 数量单元格的属性
 */
interface CellQuantityProps {
  /** 编号 */
  index: number
  /** 原料数据 */
  data: MaterialItem
  /** 原料的属性名 */
  type: keyof MaterialItem
}

/**
 * 数量单元格的组件函数
 */
const CellQuantity: FC<CellQuantityProps> = observer(
  ({ index, data, type }) => {
    const isRate = type === 'cook_yield_rate'
    const [_quantity, setQuantity] = useState<number | null>(null)

    useEffect(() => {
      const quantity = parseFloat(data[type] as string)
      setQuantity(quantity === 0 || quantity ? quantity : null)
    }, [type, data[type]])

    /**
     * 处理原料数量改变的事件
     * 更新原料数量
     * @param {string}       value     原料数量
     * @param {MaterialItem} inputData 原料信息
     */
    const handleChangeMateria = (
      value: string,
      inputData: MaterialItem = data,
    ) => {
      const {
        cook_yield_rate,
        quantity,
        cooked_quantity,
        material_cost,
        unit_ids,
        unit_id,
        isFinishedProduct,
      } = inputData

      // 自身不处理，对其他值做处理
      const num = (
        inType: keyof MaterialItem,
        compute: (cook_yield_rate: string) => string,
      ) => {
        return type === inType
          ? value
          : compute(isRate ? value : cook_yield_rate!)
      }

      const quantityData = {
        quantity: num('quantity', (rate) => {
          const nowCookedQuantity =
            type === 'cooked_quantity' ? value : cooked_quantity
          if (isRate && quantity && !cooked_quantity) return quantity
          return rate && nowCookedQuantity
            ? '' +
                Big(nowCookedQuantity)
                  .div(+rate / 100)
                  .toFixed(4)
            : ''
        }),
        cooked_quantity: num('cooked_quantity', (rate) => {
          const nowQuantity = type === 'quantity' ? value : quantity
          if (isRate && cooked_quantity && rate) return cooked_quantity!
          return rate && nowQuantity
            ? '' +
                Big(nowQuantity)
                  .times(+rate / 100)
                  .toFixed(4)
            : ''
        }),
        cook_yield_rate: num('cook_yield_rate', (rate) => rate),
      }

      store.updateListItem(index, {
        ...inputData,
        ...quantityData,
        materialRateCost: getMaterialRateCostV2({
          material_cost,
          yieldNumber: quantityData.quantity || 0,
        }),
      })
      if (isFinishedProduct) {
        store.updateBomDetail('quantity', quantityData.quantity)
      }
    }

    // 只有在熟出成率下使用防抖
    const debounceRef = useRef(_.debounce(handleChangeMateria, 1000))

    return (
      <Flex alignCenter>
        <KCInputNumber
          value={_quantity!}
          onChange={(value: number | null) => {
            const _value = value === null ? '' : `${value}`
            if (isRate) {
              setQuantity(value)
              debounceRef.current(_value, data)
              !value && debounceRef.current.flush()
              return
            }
            handleChangeMateria(_value)
          }}
          min={0}
          precision={4}
        />
        {isRate && <div className='gm-margin-left-5'>%</div>}
      </Flex>
    )
  },
)

export default CellQuantity
