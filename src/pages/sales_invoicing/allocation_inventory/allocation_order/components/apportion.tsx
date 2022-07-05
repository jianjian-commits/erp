import React, { FC } from 'react'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_METHOD_TYPE,
  PRODUCT_REASON_TYPE,
} from '@/pages/sales_invoicing/enum'
import { Modal } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { history } from '@/common/service'
import store from '../stores/receipt_store'
import { getCategoryProductTree } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'
import ApportionTable from './apportion_table'
import ApportionFormModal, { ApportionState } from './apportion_form_modal'

interface Props {
  type: 'add' | 'detail'
}

const Apportion: FC<Props> = (props) => {
  const { type } = props
  const {
    costAllocations,
    productDetails,
    validProductDetails,
    receiptDetail,
  } = store

  // validProductDetails 过滤掉空数据的商品详细
  const skuList = _.map(validProductDetails, (item) => {
    return {
      ...item.sku,
      // 添加ssu的信息
      unit_id: item?.unit_id,
      ssu_display_name: item?.sku_base_unit_name,
    }
  })

  const handleEnsure = (data: ApportionState) => {
    store.addApportionItem(data)
    if (receiptDetail?.warehouse_transfer_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted').finally(() => {
        store.clearApportionItem()
      })
    } else {
      store
        .createReceipt('toBeSubmitted')
        .then((json) => {
          history.push(
            `/sales_invoicing/allocation_inventory/allocation_order/detail?sheet_id=${json.response.warehouse_transfer_sheet?.warehouse_transfer_sheet_id}`,
          )
          return json
        })
        .finally(() => {
          store.clearApportionItem()
        })
    }
  }

  const handleAdd = () => {
    const canSubmit = store.validateField(true)
    if (!canSubmit) return
    const productData = getCategoryProductTree(skuList)
    Modal.render({
      title: t('调拨费用'),
      children: (
        <ApportionFormModal
          productData={productData}
          actionData={PRODUCT_ACTION_TYPE}
          methodData={PRODUCT_METHOD_TYPE}
          reasonData={PRODUCT_REASON_TYPE}
          onEnsure={handleEnsure}
          onCancel={() => {
            Modal.hide()
          }}
        />
      ),
    })
  }

  const handleDel = () => {
    store.clearApportionItem()
    // 删除的时候一定存在单号了，直接update
    store.updateAndGetReceipt('toBeSubmitted', true)
  }
  return (
    <ApportionTable
      data={costAllocations}
      type={type}
      onAdd={handleAdd}
      onDel={handleDel}
      actionData={PRODUCT_ACTION_TYPE}
      methodData={PRODUCT_METHOD_TYPE}
      reasonData={PRODUCT_REASON_TYPE}
    />
  )
}

export default observer(Apportion)
