import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Modal } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  DiscountTable,
  DiscountFormModal,
  DiscountState,
} from '@/pages/sales_invoicing/components'

// import store from '../stores/receipt_store'
import { DetailStore } from '../stores'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_REASON_TYPE,
} from '@/pages/sales_invoicing/enum'

interface Props {
  type: 'add' | 'detail'
}

const Discount: FC<Props> = observer((props) => {
  const { discountList } = DetailStore
  const { type } = props

  const handleEnsure = (data: DiscountState) => {
    DetailStore.addDiscountListItem(data)
  }

  const handleDiscountAdd = () => {
    Modal.render({
      title: t('金额折让'),
      children: (
        <DiscountFormModal
          actionData={PRODUCT_ACTION_TYPE}
          reasonData={PRODUCT_REASON_TYPE}
          onEnsure={handleEnsure}
          onCancel={() => {
            Modal.hide()
          }}
        />
      ),
    })
  }

  const handleDiscountDel = (index: number) => {
    DetailStore.deleteDiscountListItem(index)
  }

  return (
    <DiscountTable
      data={discountList.slice()}
      reasonData={PRODUCT_REASON_TYPE}
      actionData={PRODUCT_ACTION_TYPE}
      type={type}
      onAdd={handleDiscountAdd}
      onDel={handleDiscountDel}
    />
  )
})

export default Discount
