import React, { FC, useCallback } from 'react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import store from '../../store'
import type { CellPropsWidthOriginal } from '../interface'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import Big from 'big.js'
import { toFixedOrder } from '@/common/util'

/**
 * @deprecated
 */
const StdRealQuantity: FC<CellPropsWidthOriginal> = observer(
  ({ index, sku }) => {
    const { view_type, state } = store.order

    const handleChange = useCallback(
      (value: number) => {
        store.updateRowItem(index, 'std_real_quantity_fe', value)
        // 这里同步修改出库数包装单位，舍入两位
        store.updateRowItem(
          index,
          'real_quantity_fe',
          +toFixedOrder(Big(value).div(sku.ssu_unit_rate!)),
        )
      },
      [index, sku.ssu_unit_rate],
    )

    if (sku.isNewItem || view_type === 'create') {
      return (
        <KCDisabledCell>
          <span>-</span>
        </KCDisabledCell>
      )
    } else if (view_type === 'edit') {
      // 是待分拣以后的状态，才可以修改出库数
      if (state! > 1) {
        return (
          <Flex>
            <KCPrecisionInputNumber
              precisionType='order'
              value={sku.std_real_quantity_fe!}
              onChange={handleChange}
              className={classNames({
                'b-bg-warning': _.isNil(sku.std_real_quantity_fe),
              })}
              min={0}
              style={{ width: '70px' }}
              placeholder={t('出库数（计量单位）')}
              disabled={!!sku.parentId}
            />
            <span className='gm-padding-5'>{sku.ssu_unit_parent_name}</span>
          </Flex>
        )
      } else {
        return (
          <Flex alignCenter>
            <span>{toFixedOrder(sku.std_real_quantity_fe!)}</span>
            <span>{sku.ssu_unit_parent_name}</span>
          </Flex>
        )
      }
    } else {
      return (
        <KCDisabledCell>
          <Flex alignCenter>
            <span className='gm-padding-5'>{sku.std_real_quantity_fe!}</span>
            <span>{sku.ssu_unit_parent_name}</span>
          </Flex>
        </KCDisabledCell>
      )
    }
  },
)

export default StdRealQuantity
