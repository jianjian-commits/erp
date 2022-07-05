import React, { FC, useCallback, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../../store'

import type { CellPropsWidthOriginal } from '../interface'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import SVGEditPen from '@/svg/edit_pen.svg'
import { handleUnitName } from '@/pages/order/order_manage/components/detail/util'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { App_Type } from 'gm_api/src/common'
import { EditableText } from '@/common/components/editable_text'
import Big from 'big.js'
import { toFixedOrder } from '@/common/util'
import _ from 'lodash'

const SalePriceNoTaxCell: FC<CellPropsWidthOriginal> = observer(
  ({ index, sku }) => {
    const [editing, setEditing] = useState(false)
    /** 修改不含税单价，需要联动修改单价 */
    const handleChange = useCallback(
      (value: number) => {
        const newPrice = _.isNil(value)
          ? value
          : +Big(value || 0)
              .times(
                Big(sku?.tax || 0)
                  .div(100)
                  .plus(1),
              )
              .toFixed(2)
        store.updateRowItem(index, 'no_tax_price', value)
        store.updateRowItem(index, 'price', newPrice)
      },
      [index, sku.tax],
    )

    const basic_price = sku.prices?.find((p) => p.order_unit_id === sku.unit_id)
    if (basic_price?.current_price && !sku.price) {
      return (
        <EditableText
          value={<span>时价</span>}
          onChange={(val) => {
            if (val < 0) return
            store.updateRowItem(index, 'price', val)
          }}
        />
      )
    }

    if (!editing && !sku?.price && sku?.basic_price?.current_price) {
      return (
        <KCDisabledCell>
          <div
            className='gm-inline-block gm-cursor'
            onClick={() => setEditing(true)}
          >
            <span className=' gm-margin-right-5'>{t('时价')}</span>
            <SVGEditPen className='gm-text-primary' />
          </div>
        </KCDisabledCell>
      )
    }

    return (
      <Flex>
        <KCPrecisionInputNumber
          precisionType='order'
          value={sku?.no_tax_price}
          onChange={handleChange}
          // className={
          //   ssu.sku_id
          //     ? classNames({
          //         'b-bg-warning': +ssu.price! === 0,
          //       })
          //     : undefined
          // }
          style={{ width: '70px' }}
          placeholder={t('不含税单价')}
          disabled={
            !!(+sku.detail_status! & (1 << 12)) ||
            !!sku.parentId ||
            sku.sku_type === Sku_SkuType.COMBINE ||
            store.type === App_Type.TYPE_ESHOP
          }
          min={0}
        />
        <span className='gm-padding-5'>{`${Price.getUnit()}/${handleUnitName(
          sku,
        )}`}</span>
      </Flex>
    )
  },
)

export default SalePriceNoTaxCell
