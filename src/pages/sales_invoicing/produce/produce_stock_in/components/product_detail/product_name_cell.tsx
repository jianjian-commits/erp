import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectGroupDataItem, Tip } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'

import {
  isInShareV2,
  formatSkuListV2,
  skuGroupByCategory,
} from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { checkDigit } from '@/common/util'
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
  const { apportionList, receiptDetail } = store
  const { sku_id, sku_name } = data

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const handleSelect = (selected: ComSkuItem) => {
    const { apportionList } = store
    // 若空
    if (selected && isInShareV2(apportionList, selected.value)) {
      Tip.tip(t('该商品已加入分摊不可重复添加，如需添加请取消分摊再进行操作'))
    } else {
      store.changeProductNameSelected(index, selected)
    }
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      store.fetchSkuList(value).then((json) => {
        const {
          response: { skus, category_map },
        } = json
        setSkuList(formatSkuListV2(skus, category_map))
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

  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <Flex row alignCenter>
      {/* 加入分摊后隐藏 */}
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
        sku_name
      )}

      {/* {spu_status === 0 && <DeletedProduct />} */}
    </Flex>
  )
})

export default ProductNameCell
