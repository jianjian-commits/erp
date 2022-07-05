import React, { FC, useCallback, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Flex, Price } from '@gm-pc/react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import type { CellPropsWidthOriginal } from './detail/list/interface'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import SVGEditPen from '@/svg/edit_pen.svg'
import { handleUnitName } from '@/pages/order/order_manage/components/detail/util'

interface CellPriceProps extends CellPropsWidthOriginal {
  onChange: (index: number, key: 'price', value: number) => void
}

const CellPrice: FC<CellPriceProps> = observer(({ index, sku, onChange }) => {
  const [editing, setEditing] = useState(false)

  const handleChange = useCallback(
    (value: number) => {
      onChange(index, 'price', value)
    },
    [index, onChange],
  )

  if (
    !editing &&
    !sku.ingredients?.ingredients?.length &&
    !sku?.price &&
    sku?.basic_price?.current_price
  ) {
    return (
      <KCDisabledCell>
        <div
          className='gm-inline-block gm-cursor'
          onClick={() => setEditing(true)}
        >
          <span className='gm-margin-right-5'>{t('时价')}</span>
          <SVGEditPen className='gm-text-primary' />
        </div>
      </KCDisabledCell>
    )
  }
  return (
    <Flex>
      <KCPrecisionInputNumber
        precisionType='order'
        value={sku?.price! as number}
        onChange={handleChange}
        className={classNames({
          'b-bg-warning': _.isNil(sku?.price),
        })}
        style={{ width: '70px' }}
        placeholder={t('单价')}
        disabled={!!(+sku?.detail_status! & (1 << 12))}
      />
      <span className='gm-padding-5'>{`${Price.getUnit()}/${handleUnitName(
        sku,
      )}`}</span>
    </Flex>
  )
})

export default CellPrice
