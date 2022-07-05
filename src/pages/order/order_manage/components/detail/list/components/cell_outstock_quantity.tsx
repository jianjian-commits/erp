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
import { toFixedOrder } from '@/common/util'
import { App_Type } from 'gm_api/src/common'
import { doubleUnitOutStockText } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'
import { isCombineSku, transformOutStock } from '@/pages/order/util'

/**
 * 双单位出库数，左侧取outstock_unit_value_v2，右侧取outstock_second_base_unit_value_v2
 */
const OutStockQuantity: FC<CellPropsWidthOriginal> = observer(
  ({ index, sku }) => {
    const { view_type, state } = store.order
    const handleStdQuantityChange = useCallback(
      (value: number) => {
        store.updateRowItem(index, 'std_quantity', value)
        // 除了下单单位是辅助单位组的情况，其他情况都需要联动计算辅助单位出库数
        if (
          !globalStore.isLite &&
          sku.isUsingSecondUnitOutStock &&
          !globalStore.isSameUnitGroup(sku.unit_id!, sku.second_base_unit_id!)
        ) {
          store.updateRowItem(
            index,
            'std_quantity_second',
            _.isNil(value)
              ? (null as any)
              : toFixedOrder(
                  transformOutStock(value, sku.unit_id!, sku, 'TO_SECONDUNIT'),
                ),
          )
        }
      },
      [index],
    )

    const handleStdQuantitySecondChange = useCallback(
      (value: number) => {
        store.updateRowItem(index, 'std_quantity_second', value)
        // 只有下单单位是辅助单位组的时候，要去联动计算左侧input
        if (
          !globalStore.isLite &&
          sku.isUsingSecondUnitOutStock &&
          globalStore.isSameUnitGroup(sku.unit_id!, sku.second_base_unit_id!)
        ) {
          store.updateRowItem(
            index,
            'std_quantity',
            _.isNil(value)
              ? (null as any)
              : toFixedOrder(
                  transformOutStock(
                    value,
                    sku.unit_id!,
                    sku,
                    'FROM_SECONDUNIT',
                  ),
                ),
          )
        }
      },
      [index],
    )

    if (sku.isNewItem || view_type === 'create' || isCombineSku(sku)) {
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
              value={sku.std_quantity!}
              onChange={handleStdQuantityChange}
              className={classNames({
                'b-bg-warning': _.isNil(sku.std_quantity),
              })}
              min={0}
              style={{ width: sku.std_unit_id_second ? '70px' : '180px' }}
              placeholder={t('出库数')}
              disabled={store.type === App_Type.TYPE_ESHOP}
            />
            <span className='gm-padding-5'>
              {globalStore.getUnitName(sku.std_unit_id!) || sku.unit?.name!}
            </span>
            {!globalStore.isLite && sku.std_unit_id_second && (
              <>
                <span className='gm-margin-5'>/</span>
                <KCPrecisionInputNumber
                  precisionType='order'
                  value={sku.std_quantity_second!}
                  onChange={handleStdQuantitySecondChange}
                  className={classNames({
                    'b-bg-warning': _.isNil(sku.std_quantity_second),
                  })}
                  min={0}
                  style={{ width: '70px' }}
                  placeholder={t('辅助单位出库数')}
                  disabled={store.type === App_Type.TYPE_ESHOP}
                />
                <span className='gm-padding-5'>
                  {globalStore.getUnitName(sku.std_unit_id_second!)}
                </span>
              </>
            )}
          </Flex>
        )
      } else {
        return (
          <Flex alignCenter>
            {sku.std_unit_id_second ? (
              <span>{doubleUnitOutStockText(sku)}</span>
            ) : (
              <>
                <span>{toFixedOrder(sku.std_quantity!)}</span>
                <span>{sku.unit?.name}</span>
              </>
            )}
          </Flex>
        )
      }
    } else {
      return (
        <KCDisabledCell>
          <Flex alignCenter>
            {sku.std_unit_id_second ? (
              <span>{doubleUnitOutStockText(sku)}</span>
            ) : (
              <>
                <span>{toFixedOrder(sku.std_quantity!)}</span>
                <span>{sku.unit?.name}</span>
              </>
            )}
          </Flex>
        </KCDisabledCell>
      )
    }
  },
)

export default OutStockQuantity
