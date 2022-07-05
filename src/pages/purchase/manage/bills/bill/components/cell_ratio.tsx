import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import CellRatio from '../../../components/cell_ratio'
import { GetBasicPrice } from 'gm_api/src/merchandise'
import { toFixed, parseSsu } from '@/common/util'

import store from '../store'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import Big from 'big.js'

const Components = (props: { index: number }) => {
  const { index } = props
  const { setBasicPrice, merchandise_info, setMerchiseInfo } = store
  const supplier_id = store.info.supplier?.supplier_id
  const { supplier } = store.info
  const invoice_type = supplier?.attrs?.china_vat_invoice?.invoice_type
  const {
    ssu_unit_id,
    ssuInfos = [],
    sku_id,
    purchase_amount,
    plan_amount,
    _amount_edit_filed,
  } = store.list[index]
  // const ssu = _.find(ssuInfos, (v) => v.value === ssu_unit_id)
  function handleSsuChange(v: string) {
    const ssu = _.find(ssuInfos, (s) => s.value === v)
    const ssu_id = {
      sku_id: sku_id || '',
      unit_id: v,
    }
    store.updateRowColumn(index, 'ssu_revision', ssu?.revision!)
    /**
     * @description: 存储的信息
     */
    const info = {
      unit_id: ssu_id.unit_id,
      sku_id: ssu_id.sku_id,
      supplier_tax: merchandise_info?.[index]?.supplier_tax,
      input_tax: merchandise_info?.[index]?.input_tax,
    }
    setMerchiseInfo(index, info)
    /**
     * @description:存储的协议价税率
     */
    const negotiatedTax = {
      negotiated_tax: '0',
      sku_id: '',
      unit_id: '',
    }
    store.setNegotiatedTax(props.index, negotiatedTax)
    store.updateRowColumn(
      index,
      'tax_rate',
      invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
        ? Number(
            merchandise_info?.[index]?.supplier_tax?.[supplier_id]! ??
              merchandise_info?.[index]?.input_tax! ??
              0,
          )
        : 0,
    )
    /**
     * @description 这个是规格id
     */
    store.updateRowColumn(index, 'ssu_unit_id', v)

    /**
     * @description 采购数量(包装单位)
     */
    store.updateRowColumn(
      index,
      'purchase_sale_amount',
      purchase_amount
        ? +toFixed(Big(+purchase_amount || 0).div(ssu?.ssu_unit_rate || 1))
        : undefined,
    )

    /**
     * @description 这个是采购金额
     */
    store.updateRowColumn(index, 'purchase_money', 0)

    /**
     * @description 这个是计划采购 (包装单位)
     */
    store.updateRowColumn(
      index,
      'plan_sale_amount',
      Big(+plan_amount! || 0)
        .div(ssu?.ssu_unit_rate || 1)
        .toFixed(4),
    )

    /**
     * @description 这个是采购单价
     */
    store.updateRowColumn(index, 'purchase_price', 0)

    // 只有开启了协议价设置且选择了供应商，才会拉取协议价
    if (supplier_id && store.agreementPriceState) {
      GetBasicPrice({ supplier_id, ssu_id }).then((res) => {
        const basic_price = Number(res.response.basic_price?.price)
        negotiatedTax.negotiated_tax =
          res.response?.basic_price?.input_tax || '0'
        negotiatedTax.sku_id = ssu_id.sku_id!
        negotiatedTax.unit_id = ssu_id.unit_id!
        store.setNegotiatedTax(index, negotiatedTax)

        if (res?.response?.basic_price?.basic_price_id) {
          store.updateRowColumn(
            index,
            'tax_rate',
            +negotiatedTax.negotiated_tax,
          )
        }
        if (basic_price) {
          setBasicPrice(basic_price)
          store.updateRowColumn(
            index,
            'purchase_money',
            purchase_amount
              ? +toFixed(Big(+purchase_amount! || 0).times(basic_price))
              : 0,
          )
          if (_amount_edit_filed === 'purchase_amount') {
            store.updateRowColumn(index, 'purchase_price', basic_price)
          } else {
            store.updateRowColumn(
              index,
              'purchase_price',
              +Big(basic_price).times(+ssu?.unit.rate),
            )
          }
        }
      })
    }
  }
  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)

  if (isCommitted) {
    const target = _.find(ssuInfos, (v) => v.value === ssu_unit_id)
    return <Flex alignCenter>{target?.text || '-'}</Flex>
  }
  return (
    <CellRatio ratio={ssu_unit_id} data={ssuInfos} onSelect={handleSsuChange} />
  )
}

export default observer(Components)
