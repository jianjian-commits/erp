import { t } from 'gm-i18n'
import React, { FC, useCallback, useMemo, useRef } from 'react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

import store from '../store'
import type { DetailListItem } from '../../interface'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import { isSsuInvalid } from '../util'
import globalStore from '@/stores/global'
import { toFixedOrder } from '@/common/util'
import { isCombineSku } from '@/pages/order/util'
import { Permission } from 'gm_api/src/enterprise'
import { isZero } from '@/pages/order/number_utils'

interface QuantityProps {
  orderIndex: number
  ssuIndex: number
  original: DetailListItem
}

const Quantity: FC<QuantityProps> = observer(
  ({ orderIndex, ssuIndex, original }) => {
    const preQuantity = useRef(0)
    const ssu = original

    const handleChange = useCallback(
      <T extends keyof Ssu>(value: Ssu[T]) => {
        if (preQuantity.current === 0)
          preQuantity.current = store.list[orderIndex].list[ssuIndex]
            .quantity as number

        store.updateSsuRowItem(
          orderIndex,
          ssuIndex,
          'quantity',
          value as number,
        )
        // 原料的下单数同步改变
        Array.from({ length: ssu.ingredientsInfo?.length || 0 }).forEach(
          (item, index) => {
            const quantity =
              store.list[orderIndex].list[ssuIndex + index + 1].quantity
            store.updateSsuRowItem(
              orderIndex,
              ssuIndex + index + 1,
              'quantity',
              +toFixedOrder(
                Big(value as number)
                  .div(preQuantity.current || (value as number))
                  .times(quantity!),
              ),
            )
          },
        )
        if (value) {
          preQuantity.current = store.list[orderIndex].list[ssuIndex]
            .quantity as number
        }
      },
      [orderIndex, ssu.ingredientsInfo, ssuIndex],
    )

    const className = useMemo(() => {
      const hasPermission = globalStore.hasPermission(
        Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
      )
      const isLite = globalStore.isLite
      const hasAddOrderValue = [
        ssu.add_order_value1,
        ssu.add_order_value2,
        ssu.add_order_value3,
        ssu.add_order_value4,
      ]
        .map((item) => isZero(item?.quantity?.val))
        .includes(false)
      if (!hasPermission || isLite || isCombineSku(ssu) || !hasAddOrderValue) {
        return classNames({
          'b-bg-warning':
            ssu.sku_id &&
            ssu.unit_id &&
            (!ssu.quantity || ssu.quantity < (ssu.minimum_order_number || 0)),
        })
      }
      return ''
    }, [
      ssu.sku_id,
      ssu.unit_id,
      ssu.quantity,
      ssu.minimum_order_number,
      ssu.add_order_value1,
      ssu.add_order_value2,
      ssu.add_order_value3,
      ssu.add_order_value4,
    ])

    if (isSsuInvalid(ssu)) {
      return (
        <KCDisabledCell>
          <div>-</div>
        </KCDisabledCell>
      )
    }
    return (
      <Flex alignCenter>
        <KCPrecisionInputNumber
          // precisionType='order'
          precision={ssu.type === 2 ? 0 : globalStore.dpOrder}
          value={ssu.quantity!}
          onChange={handleChange}
          className={className}
          placeholder={t('下单数')}
          style={{ width: '70px' }}
          min={ssu.type === 2 ? 1 : 0}
          disabled={!!ssu.parentId}
        />
        <Flex className='gm-padding-left-5'>{ssu.unit?.name || '-'}</Flex>
      </Flex>
    )
  },
)

export default Quantity
