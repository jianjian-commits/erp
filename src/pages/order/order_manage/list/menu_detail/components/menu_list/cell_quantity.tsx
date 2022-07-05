import { t } from 'gm-i18n'
import React, { FC, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'
import { KCInputNumber } from '@gm-pc/keyboard'
import store from '../../store'
import type { CellPropsWidthOriginal } from '../../../../components/detail/list/interface'
import globalStore from '@/stores/global'
import { isCombineSku } from '@/pages/order/util'

const QuantityCell: FC<CellPropsWidthOriginal> = observer(
  ({ index, sku, status }) => {
    const handleChange = useCallback(
      (value: number) => {
        store.updateMenuRowItem(index, 'quantity', value as number)
        store.updateMergeSku(
          store.menuList.filter((v) => v.sku_id && v.unit_id),
          store.skuMap,
          undefined,
          store.list,
          globalStore.orderSetting,
        )
      },
      [index],
    )

    const className = useMemo(
      () =>
        classNames({
          'b-bg-warning':
            sku.sku_id &&
            sku.unit_id &&
            (!sku.quantity || +sku.quantity < +(sku.minimum_order_number || 0)),
        }),
      [sku.sku_id, sku.unit_id, sku.quantity, sku.minimum_order_number],
    )
    return (
      <Flex alignCenter>
        <KCInputNumber
          value={sku.quantity!}
          onChange={handleChange}
          className={className}
          precision={isCombineSku(sku) ? 0 : globalStore.dpOrder}
          placeholder={t('下单数')}
          min={isCombineSku(sku) ? 1 : 0}
          disabled={!!(+status! & (1 << 12))}
        />
        <Flex className='gm-padding-left-5'>{sku.unit?.name || '-'}</Flex>
      </Flex>
    )
  },
)

export default QuantityCell
