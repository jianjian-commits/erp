import React, { FC } from 'react'
import {
  ApportionTable,
  ApportionFormModal,
  ApportionState,
} from '@/pages/sales_invoicing/components'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_METHOD_TYPE,
  PRODUCT_REASON_TYPE,
} from '@/pages/sales_invoicing/enum'
import { Modal } from '@gm-pc/react'
import { t } from 'gm-i18n'
// import store from '../stores/receipt_store'
import { getCategoryProductTree } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'
import { history } from '@/common/service'
import { DetailStore } from '../stores'

interface Props {
  type: 'add' | 'detail'
}

const Apportion: FC<Props> = (props) => {
  const { type } = props
  const { apportionList } = DetailStore

  const handleEnsure = (data: ApportionState) => {
    DetailStore.addApportionItem(data)
    if (DetailStore.receiptDetail.purchase_in_stock_sheet_id) {
      DetailStore.updateAndGetReceipt('toBeSubmitted').catch(() => {
        DetailStore.clearApportionItem()
      })
    } else {
      DetailStore.createReceipt('toBeSubmitted')
        .then((response) => {
          history.push(
            '/sales_invoicing/purchase/stock_in/detail?sheet_id=' +
              response.stock_sheet.purchase_in_stock_sheet_id,
          )
          return response
        })
        .catch(() => {
          DetailStore.clearApportionItem()
        })
    }
  }

  const handleAdd = () => {
    if (DetailStore.isInvalidReceipt()) {
      return
    }
    const productData = getCategoryProductTree(
      DetailStore.getValidProductListData(),
    )
    Modal.render({
      title: t('费用分摊'),
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
    DetailStore.clearApportionItem()
    // 删除的时候一定存在单号了，直接update
    DetailStore.updateAndGetReceipt('toBeSubmitted')
  }
  return (
    <ApportionTable
      data={apportionList.slice()}
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
