import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex, MoreSelectGroupDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { formatSkuListV2, skuGroupByCategoryV2 } from '../../../../util'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'


import commonStore from '@/pages/sales_invoicing/store'
import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: ProductDetailProps
}

const renderProductItem = (item: any) => {
  return (
    <div>
      {item.text}
      {/* {item.sku_type === Sku_SkuType.PACKAGE && <SignTip text={t('包材')} />} */}
    </div>
  )
}

const ProductNameCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const { receiptDetail, changeProductNameSelected } = DetailStore
  const { fetchSkuList } = commonStore

  const { sku_id, sku_name } = data

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const handleSelect = async (selected: ComSkuItem) => {
    const { sku_id } = selected
    const { sku_stock } = await commonStore.getStock(sku_id, [
      receiptDetail?.warehouse_id!,
    ])!

    /** 当前库存数 */
    const currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'

    selected.currStockQuantity = currStockQuantity
    changeProductNameSelected(index, selected)
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      fetchSkuList(value, { sku_types: [1, 2] }).then((json) => {
        const {
          response: { skus, category_map },
        } = json
        setSkuList(skuGroupByCategoryV2(formatSkuListV2(skus, category_map)))
        return json
      })
    }
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
        isGroupList
        data={skuList}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入商品名搜索')}
        renderListItem={renderProductItem}
      />
    </Flex>
  )
})

export default ProductNameCell
