import { t } from 'gm-i18n'
import React, { useState, useRef, FC, useCallback } from 'react'
import { MoreSelect } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { ListSkuV2, Sku, Sku_SkuType } from 'gm_api/src/merchandise'

import type { TableSelectDataItem } from '@gm-pc/react'
import store, { ResponseSku, SkuWithSelectItem } from '../store'
import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import { getSkuDefaultUnitId } from '@/pages/order/util'
import _ from 'lodash'

interface CellProps {
  index: number
  original: ResponseSku
  type: string
}

const CellSsu: FC<CellProps> = observer(({ original, index, type }) => {
  const [ssuList, setSsuList] = useState<TableSelectDataItem<string>[]>([])

  const productNameRef = useRef<string>()

  const handleSelect = useCallback(
    (selected: SkuWithSelectItem) => {
      if (type === 'combine') {
        store.updateRow(index, selected)
      } else {
        const { base_unit_id, second_base_unit_id } = selected
        const unitList = _.map(getSkuUnitList(selected as Sku), (v) => {
          return {
            ...v,
            value: v.unit_id,
          }
        })
        const unit_id = getSkuDefaultUnitId(
          base_unit_id,
          second_base_unit_id,
          unitList,
        )
        store.updateRow(index, selected, unitList, unit_id)
      }
    },
    [index],
  )

  const handleSearch = useCallback((value: string) => {
    productNameRef.current = value
    ListSkuV2({
      filter_params: {
        q: value,
        on_sale: 1,
        on_shelf: 1,
        sku_type:
          type === 'combine' ? Sku_SkuType.COMBINE : Sku_SkuType.NOT_PACKAGE,
      },
      paging: { limit: 999 },
    }).then(async (json) => {
      const list = json.response.skus || []
      setSsuList(
        list.map((v) => {
          return {
            ...v,
            unit_id: v.base_unit_id,
            value: v.sku_id!,
            text: v.name!,
          }
        }),
      )

      return null
    })
  }, [])

  return (
    <MoreSelect
      data={ssuList}
      selected={original.replaceSsu!}
      onSearch={handleSearch}
      onSelect={handleSelect}
      renderListFilter={(data) => data}
      placeholder={t('输入商品编码或商品名')}
      style={{ width: '168px' }}
    />
  )
})

export default CellSsu
