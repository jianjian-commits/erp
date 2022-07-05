import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { KCInputNumber } from '@gm-pc/keyboard'

import type { DetailListItem, Sku } from './interface'
import store from './detail/store'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { App_Type } from 'gm_api/src/common'

interface Props {
  index: number
  sku: DetailListItem
  onChange: (value: DetailListItem['tax']) => void
}

const TaxCell: FC<Props> = observer(({ sku, onChange }) => {
  return (
    <Flex alignCenter>
      <KCInputNumber
        value={sku?.tax ? +sku?.tax : null}
        onChange={(value: number) => onChange(value === null ? '' : `${value}`)}
        precision={0}
        placeholder={t('税率')}
        min={0}
        max={100}
        disabled={
          !!sku.parentId ||
          sku.sku_type === Sku_SkuType.COMBINE ||
          store.type === App_Type.TYPE_ESHOP
        }
      />
      <Flex className='gm-padding-left-5'>%</Flex>
    </Flex>
  )
})

export default TaxCell
