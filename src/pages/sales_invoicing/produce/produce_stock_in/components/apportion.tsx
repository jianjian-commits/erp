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
import store from '../stores/receipt_store'
import { getCategoryProductTree } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'
import { history } from '@/common/service'

interface Props {
  type: 'add' | 'detail'
}

const Apportion: FC<Props> = (props) => {
  const { type } = props
  const { apportionList } = store

  const handleEnsure = (data: ApportionState) => {
    store.addApportionItem(data)
    if (store.receiptDetail.stock_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted').catch(() => {
        store.clearApportionItem()
      })
    } else {
      store
        .createReceipt('toBeSubmitted')
        .then((json) => {
          history.push(
            '/sales_invoicing/produce/produce_stock_in/detail?sheet_id=' +
              json.response.stock_sheet.stock_sheet_id,
          )
          return json
        })
        .catch(() => {
          store.clearApportionItem()
        })
    }
  }

  const handleAdd = () => {
    if (store.isInvalidReceipt()) {
      return
    }
    const productData = getCategoryProductTree(store.productDetails)
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
    store.clearApportionItem()
    // 删除的时候一定存在单号了，直接update
    store.updateAndGetReceipt('toBeSubmitted')
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
