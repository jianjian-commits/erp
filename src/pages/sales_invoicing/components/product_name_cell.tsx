import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectDataItem, Tip } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'

import { formatSkuListV2 } from '@/pages/sales_invoicing/util'
import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { checkDigit } from '@/common/util'
import { SignTip } from '@/pages/sales_invoicing/components'
import saleInvoiceStore from '../store'
import { toJS } from 'mobx'

const { TABLE_X } = TableXUtil
const renderProductItem = (item: ComSkuItem) => {
  return (
    <div>
      {item.text}
      {item.sku_type === Sku_SkuType.PACKAGE && <SignTip text={t('包材')} />}
    </div>
  )
}

interface Props {
  data: any
  store: any
  isInShare?: boolean // 有分摊则传
  changeProductItem: Function
  keyFields: string[]
}

const ProductNameCell: FC<Props> = observer((props) => {
  const {
    data,
    store,
    keyFields,
    changeProductItem,
    isInShare = undefined,
  } = props
  const { receiptDetail } = store
  const {
    is_replace = false,
    target_attrs_invoice_type = '',
    supplier_id = '',
  } = receiptDetail
  const { sku_id, sku_name = '' } = data
  const [skuList, setSkuList] = useState<MoreSelectDataItem<string>[]>([])

  const handleSelect = (sku: ComSkuItem) => {
    const invoice_type = target_attrs_invoice_type
    const result: Record<string, string> = {}

    if (_.isNil(sku)) {
      _.forEach(keyFields, (key) => {
        result[key] = ''
      })
      changeProductItem(result)
      return
    }
    // 若空
    if (sku && isInShare) {
      Tip.tip(t('该商品已加入分摊不可重复添加，如需添加请取消分摊再进行操作'))
    } else {
      for (const [key, value] of Object.entries(sku)) {
        if (keyFields.includes(key)) {
          result[key] = value
        }
      }
      changeProductItem(result)
    }
  }

  const handleSearch = (value: string) => {
    if (_.trim(value)) {
      saleInvoiceStore.fetchSkuList(value).then(({ response }) => {
        const { skus, category_map } = response
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

  /** 是否可编辑 */
  const canEdit = isInShare !== undefined && !isInShare && !is_replace

  return (
    <Flex row alignCenter>
      {/* 加入分摊后隐藏 */}
      {canEdit ? (
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
      ) : (
        sku_name
      )}
    </Flex>
  )
})

export default ProductNameCell
