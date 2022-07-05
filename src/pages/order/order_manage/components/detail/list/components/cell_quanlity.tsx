import { t } from 'gm-i18n'
import React, {
  FC,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import classNames from 'classnames'
import { KCInputNumber } from '@gm-pc/keyboard'

import store from '../../store'
import type { CellPropsWidthOriginal } from '../interface'
import type { DetailListItem, Sku } from '../../../interface'
import globalStore from '@/stores/global'
import { isCombineSku, transformOutStock } from '@/pages/order/util'
import { App_Type } from 'gm_api/src/common'
import { toFixedOrder } from '@/common/util'
import { Permission } from 'gm_api/src/enterprise'
import { isZero } from '@/pages/order/number_utils'
import { reaction } from 'mobx'

const QuantityCell: FC<CellPropsWidthOriginal> = observer(({ index, sku }) => {
  const preQuantity = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sku.sku_id) {
      inputRef.current!.focus()
    }
  }, [sku.sku_id])

  // 出库数更随下单数变化
  const changeRealQuantityFe = useCallback(
    <T extends keyof DetailListItem>(value: DetailListItem[T]) => {
      if (sku.isUsingSecondUnitOutStock) {
        /**
         * 开启了辅助单位，那么要存两个出库数
         */
        if (
          globalStore.isSameUnitGroup(
            sku.unit_id || '',
            sku.second_base_unit_id!,
          )
        ) {
          /**
           * 下单单位是辅助单位组
           */
          store.updateRowItem(index, 'std_quantity_second', value)
          store.updateRowItem(
            index,
            'std_quantity',
            toFixedOrder(
              transformOutStock(value, sku.unit_id, sku, 'FROM_SECONDUNIT'),
            ),
          )
          //   store.updateRowItem(index, 'std_unit_id_second', sku.unit_id)
          //   store.updateRowItem(index, 'std_unit_id', sku.base_unit_id)
        } else {
          store.updateRowItem(index, 'std_quantity', value)
          store.updateRowItem(
            index,
            'std_quantity_second',
            toFixedOrder(
              transformOutStock(value, sku.unit_id, sku, 'TO_SECONDUNIT'),
            ),
          )
        }
      } else {
        // 这里的出库数单位与下单单位一致，出库数那边再去判断单位
        store.updateRowItem(index, 'std_quantity', value)
        // store.updateRowItem(index, 'std_unit_id', sku.unit_id)
      }

      /**
       * 未称重，才能同步出库数
       * 修改组合商品的下单数要同步修改子商品的出库数
       */
      Array(sku.ingredientsInfo?.length || 0)
        .fill(0)
        .forEach((item, index2) => {
          if (store.list[index + index2 + 1].summary?.sorting_status! <= 1) {
            const ingredient = store.list[index + index2 + 1]
            // 找到配比
            const ratio = sku.ingredients?.ingredients?.find(
              (i) => i.sku_id === ingredient.sku_id,
            )?.ratio
            try {
              store.updateRowItem(
                index + index2 + 1,
                'std_quantity',
                +Big((value ?? 0) as number).times(ratio!),
              )
            } catch (error) {}
          }
        })
    },
    [index, sku.isUsingSecondUnitOutStock, sku.unit_id],
  )

  const handleChange = useCallback(
    <T extends keyof DetailListItem>(value: DetailListItem[T]) => {
      store.updateRowItem(index, 'quantity', value)
      // 原料的下单数同步改变
      Array(sku.ingredientsInfo?.length || 0)
        .fill(0)
        .forEach((item, index2) => {
          const ingredient = store.list[index + index2 + 1]
          // 找到配比
          const ratio = sku.ingredients?.ingredients?.find(
            (i) => i.sku_id === ingredient.sku_id,
          )?.ratio
          try {
            store.updateRowItem(
              index + index2 + 1,
              'quantity',
              +Big((value ?? 0) as number).times(ratio!),
            )
          } catch (error) {}
        })
      if (value) {
        preQuantity.current = value as number
      }
      // 未称重，才能同步出库数 || 新添加的SKU也需要同步出库数
      if (sku.summary?.sorting_status! <= 1 || sku.isNewItem) {
        changeRealQuantityFe((value as number) || 0)
      }
      //   ;(sku.summary?.sorting_status! <= 1 || sku.isNewItem) &&
      //     changeRealQuantityFe((value as number) || 0)
    },
    [index, sku, changeRealQuantityFe],
  )

  const className = useMemo(() => {
    const hasPermission = globalStore.hasPermission(
      Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
    )
    const isLite = globalStore.isLite
    const hasAddOrderValue = [
      sku.add_order_value1,
      sku.add_order_value2,
      sku.add_order_value3,
      sku.add_order_value4,
    ]
      .map((item) => isZero(item?.quantity?.val))
      .includes(false)
    if (!hasPermission || isLite || !hasAddOrderValue) {
      return classNames({
        'b-bg-warning':
          sku.sku_id &&
          sku.unit_id &&
          (!sku.quantity || sku.quantity < (sku.minimum_order_number || 0)),
      })
    }
    return ''
  }, [
    sku.sku_id,
    sku.unit_id,
    sku.quantity,
    sku.minimum_order_number,
    sku.add_order_value1,
    sku.add_order_value2,
    sku.add_order_value3,
    sku.add_order_value4,
  ])

  return (
    <Flex alignCenter>
      <KCInputNumber
        ref={inputRef}
        value={sku.quantity!}
        onChange={handleChange}
        className={className}
        precision={isCombineSku(sku) ? 0 : globalStore.dpOrder}
        placeholder={t('下单数')}
        min={isCombineSku(sku) ? 1 : 0}
        disabled={
          !!(+sku.detail_status! & (1 << 12)) ||
          !!sku.parentId ||
          store.type === App_Type.TYPE_ESHOP
        }
      />
      {!globalStore.isLite && (
        <Flex className='gm-padding-left-5'>{sku.unit?.name || '-'}</Flex>
      )}
    </Flex>
  )
})

export default QuantityCell
