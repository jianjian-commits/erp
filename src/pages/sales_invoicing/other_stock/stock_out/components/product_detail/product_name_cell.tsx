import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectGroupDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import commonStore from '@/pages/sales_invoicing/store'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../../stores/detail_store'
import globalStore from '@/stores/global'
import { SignTip } from '@/pages/sales_invoicing/components'
import { formatSkuListV2, skuGroupByCategoryV2 } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import {
  SalesInvoicingSheet,
  ComSkuItem,
} from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'

interface NameProp {
  index: number
  data: SalesInvoicingSheet.StockInProductDetail
}

const renderProductItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.sku_type === Sku_SkuType.PACKAGE && <SignTip text={t('包材')} />}
    </div>
  )
}

const { TABLE_X } = TableXUtil

const ProductNameCell: FC<NameProp> = observer((props) => {
  const { index, data } = props

  const { receiptDetail } = store

  const { sku_id, sku_name } = data

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const handleSelect = async (selected: ComSkuItem) => {
    const sku_id = selected?.sku_id
    let currStockQuantity = '0'
    if (sku_id) {
      const { sku_stock } = await commonStore.getStock(sku_id, [
        receiptDetail?.warehouse_id,
      ])
      /** 当前库存数 */
      currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'
      selected.currStockQuantity = currStockQuantity
    }
    store.changeProductNameSelected(index, {
      ...selected,

      currStockQuantity,
      units: selected.units,
      sku_base_unit_id: selected.sku_base_unit_id,
      second_base_unit_ratio: selected.second_base_unit_ratio,
    })
  }

  const handleSearch = (value: string) => {
    store.fetchSkuList(value).then(({ response }) => {
      const { skus, category_map } = response
      setSkuList(skuGroupByCategoryV2(formatSkuListV2(skus, category_map)))
    })
  }

  let selected

  if (sku_id && sku_name) {
    selected = {
      value: sku_id,
      text: sku_name,
    }
  }
  console.log('skuList', ...skuList)
  return (
    <Flex row alignCenter>
      <KCMoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={skuList}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入商品名搜索')}
        renderListFilter={(data) => {
          return data
        }}
        renderListItem={renderProductItem}
        isGroupList
      />
    </Flex>
  )
})

export default ProductNameCell
