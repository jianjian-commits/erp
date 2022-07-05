import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Flex, Price } from '@gm-pc/react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import store from '../store'

import type { DetailListItem } from '../../interface'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import SVGEditPen from '@/svg/edit_pen.svg'
import { isSsuInvalid } from '../util'
import { handleUnitName } from '@/pages/order/order_manage/components/detail/util'

interface CellPriceProps {
  orderIndex: number
  ssuIndex: number
  original: DetailListItem
}
const CellPrice: FC<CellPriceProps> = observer(
  ({ orderIndex, ssuIndex, original }) => {
    const [editing, setEditing] = useState(false)
    function handleChange<T extends keyof DetailListItem>(
      key: T,
      value: DetailListItem[T],
    ) {
      store.updateSsuRowItem(orderIndex, ssuIndex, key, value)
    }

    const ssu = original
    if (isSsuInvalid(ssu)) {
      return (
        <KCDisabledCell>
          <div>-</div>
        </KCDisabledCell>
      )
    }
    if (!editing && !ssu?.price && ssu?.basic_price?.current_price) {
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
      <Flex alignCenter>
        <KCPrecisionInputNumber
          precisionType='order'
          value={ssu?.price!}
          onChange={handleChange.bind(null, 'price')}
          className={classNames({
            'b-bg-warning': _.isNil(ssu?.price),
          })}
          style={{ width: '70px' }}
          placeholder={t('单价')}
          min={0}
          disabled={!!ssu.parentId}
        />
        <span className='gm-padding-5'>{`${Price.getUnit()}/${
          handleUnitName(ssu) || '-'
        }`}</span>
      </Flex>
    )
  },
)

export default CellPrice
