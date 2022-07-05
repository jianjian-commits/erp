import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'

import { KCInput } from '@gm-pc/keyboard'
import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import store from '../store'

import type { DetailListItem } from '../../interface'
import { isSsuInvalid } from '../util'
interface CellRemarkProps {
  orderIndex: number
  ssuIndex: number
  original: DetailListItem
}

const CellRemark: FC<CellRemarkProps> = observer(
  ({ orderIndex, ssuIndex, original }) => {
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

    return (
      <KCInput
        onChange={(e) => handleChange('remark', e.target.value)}
        value={ssu.remark}
        onFocus={(e) => {
          e.target.select()
        }}
        placeholder={t('备注')}
        maxLength={30}
        disabled={!!(ssu.parentId || ssu.ingredientsInfo)}
      />
    )
  },
)

export default CellRemark
