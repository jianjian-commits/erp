import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'

import { KCInput } from '@gm-pc/keyboard'
import store from '../../store'

import type { CellPropsWidthOriginal } from '../interface'
import type { DetailListItem, Sku } from '../../../interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { App_Type } from 'gm_api/src/common'

const CellRemark: FC<CellPropsWidthOriginal> = observer(({ index, sku }) => {
  function handleChange<T extends keyof DetailListItem>(
    key: T,
    value: DetailListItem[T],
  ) {
    store.updateRowItem(index, key, value)
  }
  return (
    <KCInput
      onChange={(e) => handleChange('remark', e.target.value)}
      value={sku.remark}
      onFocus={(e) => {
        e.target.select()
      }}
      style={{ width: '80px' }}
      placeholder={t('备注')}
      maxLength={30}
      disabled={
        !!(+sku.detail_status! & (1 << 12)) ||
        !!sku.parentId ||
        sku.sku_type === Sku_SkuType.COMBINE ||
        store.type === App_Type.TYPE_ESHOP
      }
    />
  )
})

export default CellRemark
