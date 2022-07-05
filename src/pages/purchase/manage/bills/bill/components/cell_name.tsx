import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { observer } from 'mobx-react'
import {
  ListSkuV2,
  ListSkuV2Request_RequestData,
  GetBasicPrice,
  Sku_SupplierCooperateModelType,
  Sku_SkuType,
  GetManyQuotationBasicPriceV2,
} from 'gm_api/src/merchandise'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'

import store, { initBill } from '../store'
import _ from 'lodash'
import { dealWithSku } from '../../../../util'

import type { MoreSelectDataItem, MoreSelectGroupDataItem } from '@gm-pc/react'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { unit } from '@/pages/sales_invoicing/util'

type SelectItem = MoreSelectDataItem<string>

const CellName = (props: { index: number }) => {
  const { supplier } = store.info
  const invoice_type = supplier?.attrs?.china_vat_invoice?.invoice_type!

  const [list, setList] = useState<MoreSelectGroupDataItem<string>[]>([])

  function handleSelect(selected: SelectItem) {
    const { sku_id, purchase_unit_id } = selected || { sku: '' }
    const supplier_id = store.info.supplier?.supplier_id

    // 需要存的信息
    const info = {
      sku_id: sku_id,
      supplier_tax: selected?.supplier_input_taxs?.supplier_input_tax || '',
      input_tax: selected?.input_tax || '',
    }
    const negotiatedTax = {
      negotiated_tax: '0',
      sku_id: '',
    }
    store.setMerchiseInfo(props.index, info)
    store.setNegotiatedTax(props.index, negotiatedTax)

    const levelData = _.map(selected?.sku_level?.sku_level! || [], (item) => ({
      ...item,
      text: item?.name!,
      value: item?.level_id!,
    }))
    store.updateRow(props.index, {
      ...(selected || initBill),
      supplier_cooperate_model_type:
        Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
      purchase_amount: undefined,
      purchase_sale_amount: undefined,
      purchase_price: 0,
      purchase_money: 0,
      remark: '',
      purchase_unit_name: selected?.purchase_unit_name,
      purchase_task_serial_no: '',
      levelData,
      tax_rate:
        invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
          ? Number(
              selected?.supplier_input_taxs?.supplier_input_tax?.[
                supplier_id
              ] ??
                selected?.input_tax ??
                0,
            )
          : 0,
    })

    // 只有开启了协议价设置且选择了供应商，才会拉取协议价
    if (supplier && sku_id && store.agreementPriceState) {
      GetManyQuotationBasicPriceV2({
        supplier_skus: [{ supplier_id, sku_id, unit_id: purchase_unit_id }],
      }).then((res) => {
        const { basic_prices } = res.response
        const abc = supplier_id + '_' + sku_id + '_' + purchase_unit_id
        negotiatedTax.negotiated_tax = basic_prices?.[abc]?.input_tax || '0'
        negotiatedTax.sku_id = basic_prices?.[abc]?.sku_id || ''
        // negotiatedTax.unit_id = ssu_id?.unit_id || ''
        const basic_price = Number(
          basic_prices?.[abc]?.items.basic_price_items[0].fee_unit_price.val!,
        )
        store.setNegotiatedTax(props.index, negotiatedTax)
        if (basic_prices?.[abc]?.basic_price_id) {
          store.updateRowColumn(
            props.index,
            'tax_rate',
            +negotiatedTax.negotiated_tax,
          )
        }
        if (basic_price) {
          store.updateRowColumn(props.index, 'purchase_price', basic_price)
        }
        if (+negotiatedTax.negotiated_tax) {
          store.updateRowColumn(
            props.index,
            'tax_rate',
            +negotiatedTax.negotiated_tax,
          )
        }
      })
    }
  }

  function handleSearch(text: string) {
    ListSkuV2({
      filter_params: { q: text, sku_type: Sku_SkuType.NOT_PACKAGE },
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }).then((json) => {
      const skuList = dealWithSku(
        json.response.skus!,
        json?.response?.category_map!,
      )
      const skuGroupList = [
        {
          label: t('当前供应商'),
          children: [] as MoreSelectDataItem<string>[],
        },
        {
          label: t('非当前供应商'),
          children: [] as MoreSelectDataItem<string>[],
        },
      ]
      skuList.forEach((v) => {
        if (v.supplier_id === supplier?.value) {
          skuGroupList[0].children.push(v)
        } else {
          skuGroupList[1].children.push(v)
        }
      })
      setList(skuGroupList)
      return null
    })
  }

  const sku = store.list[props.index]
  const { sku_id, name } = sku
  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)
  if (isCommitted) return <Flex alignCenter>{name}</Flex>
  const selected: MoreSelectDataItem<string> | undefined =
    sku_id && name
      ? {
          value: `${sku_id}`,
          text: name,
        }
      : undefined

  return (
    <KCMoreSelect
      isGroupList
      data={list}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      renderListFilter={(data: MoreSelectGroupDataItem<string>[]) => {
        const result: MoreSelectGroupDataItem<string>[] = []
        data.forEach((item) => {
          const list = item.children
          if (list.length) {
            result.push({ ...item, children: list })
          }
        })
        return result
      }}
      placeholder={t('输入自定义编码或者商品名')}
      renderListItem={(item) => {
        return <div key={item.value}>{item.text}</div>
      }}
    />
  )
}

export default observer(CellName)
