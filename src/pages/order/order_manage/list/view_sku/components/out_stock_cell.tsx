import React, { FC, useCallback } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import type { SkuDetail } from '../../../../interface'
import { toFixedOrder } from '@/common/util'
import { getOrderUnitName, transformOutStock } from '@/pages/order/util'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import { doubleUnitOutStockText } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'

interface OutStockCellProps {
  index: number
}

/**
 * 要展示双出库数
 */
const OutStockCell: FC<OutStockCellProps> = ({ index }) => {
  const d: SkuDetail = store.list[index]

  // 出库数，出库单位
  const std_quantity = d.outstock_unit_value_v2?.quantity?.val
  const std_quantity_second =
    d.outstock_second_base_unit_value_v2?.quantity?.val

  const handleStdQuantityChange = useCallback(
    (value: number) => {
      store.updateSku(index, 'outstock_unit_value_v2', {
        ...d.outstock_unit_value_v2,
        quantity: {
          unit_id: d.std_unit_id!,
          val: _.isNull(value) ? null : `${value}`,
        },
      })

      // 除了下单单位是辅助单位组的情况，其他情况都需要联动计算辅助单位出库数
      if (
        !globalStore.isLite &&
        d.isUsingSecondUnitOutStock &&
        !globalStore.isSameUnitGroup(d.unit_id!, d.second_base_unit_id!)
      ) {
        store.updateSku(index, 'outstock_second_base_unit_value_v2', {
          ...d.outstock_second_base_unit_value_v2,
          quantity: {
            unit_id: d.std_unit_id_second!,
            val: _.isNil(value)
              ? (null as any)
              : toFixedOrder(
                  transformOutStock(value, d.unit_id!, d, 'TO_SECONDUNIT'),
                ),
          },
        })
      }
    },
    [index],
  )

  const handleStdQuantitySecondChange = useCallback(
    (value: number) => {
      store.updateSku(index, 'outstock_second_base_unit_value_v2', {
        ...d.outstock_second_base_unit_value_v2,
        quantity: {
          unit_id: d.std_unit_id_second!,
          val: _.isNull(value) ? null : `${value}`,
        },
      })
      // 只有下单单位是辅助单位组的时候，要去联动计算左侧input
      if (
        !globalStore.isLite &&
        d.isUsingSecondUnitOutStock &&
        globalStore.isSameUnitGroup(d.unit_id!, d.second_base_unit_id!)
      ) {
        store.updateSku(index, 'outstock_unit_value_v2', {
          ...d.outstock_unit_value_v2,
          quantity: {
            unit_id: d.std_unit_id!,
            val: _.isNil(value)
              ? (null as any)
              : toFixedOrder(
                  transformOutStock(value, d.unit_id!, d, 'FROM_SECONDUNIT'),
                ),
          },
        })
      }
    },
    [index],
  )

  if (d.editing) {
    if (d.order?.state! > 1) {
      return (
        <Flex>
          <PrecisionInputNumber
            precisionType='order'
            value={std_quantity!}
            onChange={handleStdQuantityChange}
          />
          <span className='gm-padding-5'>
            {globalStore.getUnitName(d.std_unit_id!) || d.unit?.name!}
          </span>
          {!globalStore.isLite && d.std_unit_id_second && (
            <>
              <span className='gm-margin-5'>/</span>
              <PrecisionInputNumber
                precisionType='order'
                value={std_quantity_second!}
                onChange={handleStdQuantitySecondChange}
              />
              <span className='gm-padding-5'>
                {globalStore.getUnitName(d.std_unit_id_second!)}
              </span>
            </>
          )}
        </Flex>
      )
    } else {
      return (
        <div>
          {toFixedOrder(std_quantity || 0) +
            getOrderUnitName(d.parentUnit, d.unit!)}
        </div>
      )
    }
  }
  return (
    <div>
      {d.std_unit_id_second ? (
        <span>{doubleUnitOutStockText(d as any)}</span>
      ) : (
        <>
          <span>{toFixedOrder(std_quantity!)}</span>
          <span>{d.unit?.name}</span>
        </>
      )}
    </div>
  )
}

export default observer(OutStockCell)
