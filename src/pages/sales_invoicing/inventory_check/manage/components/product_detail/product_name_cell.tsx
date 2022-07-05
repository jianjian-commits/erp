import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store from '../../stores/detail_store'
import { formatSkuListV2, skuGroupByCategoryV2 } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import { SalesInvoicingSheet } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { SignTip } from '@/pages/sales_invoicing/components'

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

  const { sku_id, sku_name } = data

  const [skuList, setSkuList] = useState<MoreSelectDataItem<string>[]>([])

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    store.changeProductNameSelected(index, selected)
  }

  const handleSearch = (value: string) => {
    store.getSkuList(value).then(({ response }) => {
      const { skus, category_map } = response
      // setSkuList(skuGroupByCategoryV2(formatSkuListV2(skus, category_map)))
      setSkuList(formatSkuListV2(skus, category_map))
    })
  }

  let selected

  if (sku_id && sku_name) {
    selected = {
      value: sku_id,
      text: sku_name,
    }
  }

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
        // isGroupList
      />
    </Flex>
  )
})

export default ProductNameCell
