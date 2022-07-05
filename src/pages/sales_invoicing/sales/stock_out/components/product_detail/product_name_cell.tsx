import * as React from 'react'
import { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import { TableXUtil } from '@gm-pc/table-x'
import { Flex, MoreSelectDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'

import { Sku_SkuType } from 'gm_api/src/merchandise'

import { formatSkuListV2 } from '../../../../util'

import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { SignTip } from '@/pages/sales_invoicing/components'

import commonStore from '@/pages/sales_invoicing/store'
import { PDetail } from '../../stores/detail_store'
import { DetailStore } from '../../stores/index'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const renderProductItem = (item: ComSkuItem) => {
  return (
    <div>
      {item.text}
      {item.sku_type === Sku_SkuType.PACKAGE && <SignTip text={t('包材')} />}
    </div>
  )
}

const ProductNameCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const { sku_id, sku_name } = data
  const { receiptDetail } = DetailStore
  const { order_id } = receiptDetail

  const [skuList, setSkuList] = useState<MoreSelectDataItem<string>[]>([])

  const handleSelect = async (selected: ComSkuItem) => {
    const { sku_id } = selected
    const { sku_stock } = await commonStore.getStock(sku_id, [
      receiptDetail?.warehouse_id!,
    ])
    /** 当前库存数 */
    const currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'
    selected.currStockQuantity = currStockQuantity
    DetailStore.changeProductNameSelected(index, selected)

    // 避免修改供应商时数据不对，因此这里做清除处理
    // setSkuList([])
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      commonStore
        .fetchSkuList(value, { sku_types: [1, 2] })
        .then(({ response }) => {
          const { skus, category_map } = response
          // setSkuList(skuGroupByCategoryV2(formatSkuListV2(skus, category_map)))
          setSkuList(formatSkuListV2(skus, category_map))
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
      {order_id !== '0' ? (
        sku_name
      ) : (
        <KCMoreSelect
          style={{
            width: TABLE_X.WIDTH_SEARCH,
          }}
          data={skuList}
          // isGroupList
          selected={selected}
          onSelect={handleSelect}
          onSearch={handleSearch}
          placeholder={t('请输入商品名搜索')}
          renderListFilter={(data) => {
            return data
          }}
          renderListItem={renderProductItem}
        />
      )}

      {/* {spu_status === 0 && <DeletedProduct />} */}
    </Flex>
  )
})

export default ProductNameCell
