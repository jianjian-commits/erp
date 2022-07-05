import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, MoreSelectGroupDataItem } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import store, { PDetail } from '../../stores/receipt_store'
import commonStore from '@/pages/sales_invoicing/store'

import { formatSkuListV2 } from '@/pages/sales_invoicing/util'

import { TableXUtil } from '@gm-pc/table-x'
import { ComSkuItem } from '@/pages/sales_invoicing/interface'
import { SignTip } from '@/pages/sales_invoicing/components'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

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

  const [skuList, setSkuList] = useState<MoreSelectGroupDataItem<string>[]>([])

  const { receiptDetail } = store

  const handleSelect = async (selected: ComSkuItem) => {
    const invoice_type = receiptDetail?.target_attrs_invoice_type
    const { sku_id } = selected
    const { sku_stock } = await commonStore.getStock(sku_id, [
      receiptDetail?.warehouse_id as string,
    ])
    const supplier_id = receiptDetail.supplier_id
    /** 当前库存数 */
    const currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'
    // const base_unit_id = sku_stock.base_unit_id
    // const ssu_base_unit_name = globalStore.getUnitName(base_unit_id)

    selected.currStockQuantity = currStockQuantity
    // selected.ssu_base_unit_name = ssu_base_unit_name
    store.changeProductNameSelected(index, selected)
    store.changeProductDetailsItem(index, {
      units: selected.units,
      sku_base_unit_id: selected.sku_base_unit_id,
      currStockQuantity,
      tax_rate:
        invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
          ? Number(
              selected?.supplier_input_taxs?.supplier_input_tax?.[
                supplier_id!
              ] ??
                selected?.input_tax! ??
                0,
            )
          : 0,
    })

    // 避免修改供应商时数据不对，因此这里做清除处理
    // setSkuList([])
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
        renderListFilter={(data) => {
          return data
        }}
        renderListItem={renderProductItem}
      />

      {/* {spu_status === 0 && <DeletedProduct />} */}
    </Flex>
  )
})

export default ProductNameCell
