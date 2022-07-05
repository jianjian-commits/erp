import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectDataItem, MoreSelectGroupDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'

import { formatSkuListV2, skuGroupByCategoryV2 } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { SignTip } from '@/pages/sales_invoicing/components'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const renderProductItem = (item: any) => {
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

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const handleSelect = (selected: ComSkuItem) => {
    store.changeProductNameSelected(index, selected)
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      store.fetchSkuList(value).then((json) => {
        const {
          response: { sku_response },
        } = json
        setSkuList(
          skuGroupByCategoryV2(
            formatSkuListV2(sku_response?.skus!, sku_response?.category_map!),
          ),
        )
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
        data={skuList.slice()}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入商品名搜索')}
        renderListItem={renderProductItem}
        isGroupList
      />

      {/* {spu_status === 0 && <DeletedProduct />} */}
    </Flex>
  )
})

export default ProductNameCell
