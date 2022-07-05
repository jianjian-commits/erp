import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectGroupDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/detail_store'
import {
  formatSkuList,
  skuGroupByCategory,
  formatSkuListV2,
  skuGroupByCategoryV2,
} from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { checkDigit } from '@/common/util'
import { SignTip } from '@/pages/sales_invoicing/components'

interface NameProp {
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

const { TABLE_X } = TableXUtil

const ProductNameCell: FC<NameProp> = observer((props) => {
  const { index, data } = props

  const { sku_id, sku_name } = data
  const { receiptDetail } = store

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const handleSelect = (selected: ComSkuItem) => {
    store.changeProductNameSelected(index, selected)
    // 避免修改供应商时数据不对，因此这里做清除处理
    // setSkuList([])
  }

  const handleSearch = (value: string) => {
    store.fetchSkuList(value).then((json) => {
      const { skus, category_map } = json.response
      setSkuList(skuGroupByCategoryV2(formatSkuListV2(skus, category_map)))
      // setSkuList(
      //   skuGroupByCategory(formatSkuList(json.response.sku_infos, true)),
      // )
      return json
    })
  }

  let selected

  if (sku_id && sku_name) {
    selected = {
      value: sku_id,
      text: sku_name,
    }
  }

  const canEdit = !checkDigit(receiptDetail.status, 8)

  console.log('skuList', ...skuList)
  return (
    <Flex row alignCenter>
      {canEdit ? (
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
      ) : (
        sku_name
      )}
    </Flex>
  )
})

export default ProductNameCell
