import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'

import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import store from '../../store'
import type { CellPropsWidthOriginal } from '../interface'
import { toFixedOrder } from '@/common/util'

/**
 * @deprecated
 */
const RealQuantity: FC<CellPropsWidthOriginal> = observer(({ index, sku }) => {
  const { view_type } = store.order

  if (sku.isNewItem || view_type === 'create') {
    return (
      <KCDisabledCell>
        <span>-</span>
      </KCDisabledCell>
    )
  } else {
    // 是待分拣以后的状态，才可以修改出库数
    return (
      <KCDisabledCell>
        <Flex alignCenter>
          <span className='gm-padding-5'>
            {toFixedOrder(sku.real_quantity_fe!)}
          </span>
          <span>{sku.ssu_unit_name}</span>
        </Flex>
      </KCDisabledCell>
    )
  }
})

export default RealQuantity
