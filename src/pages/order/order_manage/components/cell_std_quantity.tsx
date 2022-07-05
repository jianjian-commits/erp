import React, { FC, useCallback } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '@/pages/order/order_manage/list/menu_detail/store'

import type { CellPropsWidthOriginal } from './detail/list/interface'
import { toFixedOrder } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { Sku } from '@/pages/order/order_manage/components/interface'

interface CellStdRealQuantityProps extends CellPropsWidthOriginal {
  onChange: (index: number, key: keyof Sku, value: number) => void
  isBaseUnit?: boolean
}

const CellStdQuantity: FC<CellStdRealQuantityProps> = observer(
  ({ index, sku, onChange }) => {
    const handleChange = useCallback(
      (value: number) => {
        onChange(index, 'std_quantity', value)
        // 让商品的称重状态变成已称重
        onChange(index, 'sorting_status', 2)
      },
      [index, onChange],
    )

    if (store.order.state! > 1) {
      return (
        <Flex>
          <KCPrecisionInputNumber
            precisionType='order'
            value={sku.std_quantity as any}
            onChange={handleChange}
            className={classNames({
              'b-bg-warning': _.isNil(sku.std_quantity),
            })}
            min={0}
            style={{ width: '70px' }}
            placeholder={t('出库数')}
          />
          <span className='gm-padding-5'>{sku.unit?.name}</span>
        </Flex>
      )
    } else {
      return (
        <Flex alignCenter>
          <span>{toFixedOrder(Big(sku.std_quantity || 0))}</span>
          <span>{sku.unit?.name || '-'}</span>
        </Flex>
      )
    }
  },
)

export default CellStdQuantity
