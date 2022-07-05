import React, { useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { observer } from 'mobx-react'
import {
  ListSkuV2,
  Sku_SkuType,
  ListSkuV2Request_RequestData,
} from 'gm_api/src/merchandise'

import store from '../store'
import purchaseStore from '../../../../store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { ListSkuStock, SkuStock } from 'gm_api/src/inventory'
import { dealWithSku } from '../../../../util'
import { list2Map, toFixed } from '@/common/util'
import globalStore from '../../../../../../stores/global'
import type { Spec } from '../store'

interface SelectItem extends Spec, MoreSelectDataItem<string> {}

const SkuSelector = (props: { index: number }) => {
  function handleSelect(selected: SelectItem) {
    const sku_level_data =
      selected.sku_level?.sku_level?.length! > 0
        ? _.map(selected.sku_level?.sku_level, (item) => {
            return {
              ...item,
              text: item?.name!,
              value: item?.level_id!,
            }
          })
        : []
    store.updateListItem(
      props.index,
      selected
        ? {
            ...selected,
            supplier:
              _.find(
                purchaseStore.suppliers,
                (v) => v.value === selected.supplier_id,
              ) || undefined,
            purchaser:
              _.find(
                purchaseStore.purchasers,
                (v) => v.value === selected.purchaser_id,
              ) || undefined,
            sku_level_data,
          }
        : undefined,
    )
  }

  function handleSearch(text: string) {
    ListSkuV2({
      filter_params: { q: text, sku_type: Sku_SkuType.NOT_PACKAGE },
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }).then(async (json) => {
      const res = await ListSkuStock({
        paging: { limit: 999 },
        unit_stock_map: true,
        sku_ids: (json.response.skus! || []).map((v) => v?.sku_id!),
      })
      const skuStockMap = list2Map(res.response.sku_stocks, 'sku_id')
      const list = _.map(
        dealWithSku(json.response.skus!, json?.response?.category_map!),
        (v) => {
          const stock: SkuStock = skuStockMap[v?.value!] || {}
          return {
            ...v,
            current_inventory:
              toFixed(+stock.available_stock?.base_unit?.quantity! || 0) +
              globalStore.unitMap[stock.available_stock?.base_unit?.unit_id!]
                ?.text,
            plan_purchase_amount: undefined,
            sale_purchase_amount: undefined,
            supplier: undefined,
            purchaser: undefined,
          }
        },
      )
      setList(list)

      return null
    })
  }

  const [list, setList] = useState<MoreSelectDataItem<string>[]>([])
  const sku = store.specDetail.list[props.index]
  const { sku_id, name } = sku
  const selected: MoreSelectDataItem<string> | undefined =
    sku_id && name
      ? {
          value: `${sku_id}`,
          text: name,
        }
      : undefined

  return (
    <KCMoreSelect
      data={list}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      renderListFilter={(data) => data}
      placeholder={t('输入自定义编码或者商品名')}
      renderListItem={(item) => {
        return <div key={item.value}>{item.text}</div>
      }}
    />
  )
}

export default observer(SkuSelector)
