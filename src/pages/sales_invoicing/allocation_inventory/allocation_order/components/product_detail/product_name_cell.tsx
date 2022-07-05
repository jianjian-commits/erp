import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectDataItem, Tip } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'

import { isSharing } from '@/pages/sales_invoicing/allocation_inventory/util'
import { formatSkuListV2 } from '@/pages/sales_invoicing/util'
import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { checkDigit } from '@/common/util'
import { SignTip } from '@/pages/sales_invoicing/components'
import { Sku_SkuType } from 'gm_api/src/merchandise/types'

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
  const { costAllocations, receiptDetail } = store
  const skuUnits = costAllocations[0]?.sku_units || []
  const { sku_id, sku } = data
  const [skuList, setSkuList] = useState<MoreSelectDataItem<string>[]>([])

  const handleSelect = async (selected: ComSkuItem) => {
    // 判断分摊
    if (selected && isSharing(skuUnits, selected.sku_id)) {
      Tip.danger(
        t('该商品已加入分摊不可重复添加，如需添加请取消分摊再进行操作'),
      )
    } else {
      store.changeProductNameSelected(index, selected)
    }
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      store.fetchSkuList(value).then((json) => {
        const { skus, category_map } = json.response
        setSkuList(formatSkuListV2(skus, category_map))

        return json
      })
    }
  }

  let selected
  if (sku_id) {
    selected = {
      value: sku?.sku_id,
      text: sku?.name,
    }
  }

  const canEdit =
    !isSharing(skuUnits, sku_id) && !checkDigit(receiptDetail.status, 8)

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
        />
      ) : (
        <>{sku.name}</>
      )}
    </Flex>
  )
})

export default ProductNameCell
