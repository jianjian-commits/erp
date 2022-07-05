import {
  DiscountFormModal,
  DiscountState,
  DiscountTable,
} from '@/pages/sales_invoicing/components'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../store'
import Big from 'big.js'

import { Modal, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { DISCOUNT_ACTION_ENUM, DISCOUNT_REASON_ENUM } from '../../../enum'
import { SettleSheet_AmountDiscount_DiscountType } from 'gm_api/src/finance'

const Discount: FC<{ type: 'add' | 'detail' }> = observer((props) => {
  const {
    discountList,
    totalDiscount,
    receiptDetail: { total_price },
  } = store

  const handleEnsure = (data: DiscountState) => {
    store.addDiscountListItem(data)
  }

  const handleVerify = (data: DiscountState) => {
    let total = totalDiscount

    if (
      +data.action ===
      SettleSheet_AmountDiscount_DiscountType.DISCOUNT_TYPE_ADD_AMOUNT
    ) {
      total = +Big(total).plus(data.money!)
    } else if (
      +data.action ===
      SettleSheet_AmountDiscount_DiscountType.DISCOUNT_TYPE_DELTA_AMOUNT
    ) {
      total = +Big(total).minus(data.money!)
    }

    if (+Big(total_price ?? 0).plus(total ?? 0) < 0) {
      Tip.danger(t('折让金额不能使应付金额小于0'))
      return false
    } else {
      return true
    }
  }

  const handleDiscountAdd = () => {
    Modal.render({
      title: t('金额折让'),
      children: (
        <DiscountFormModal
          actionData={DISCOUNT_ACTION_ENUM}
          reasonData={DISCOUNT_REASON_ENUM}
          moneyPrecisionType='dpSupplierSettle'
          onEnsure={handleEnsure}
          onCancel={() => {
            Modal.hide()
          }}
          onVerify={handleVerify}
        />
      ),
    })
  }

  const handleDiscountDel = (index: number) => {
    store.deleteDiscountListItem(index)
  }
  return (
    <DiscountTable
      data={discountList.slice()}
      reasonData={DISCOUNT_REASON_ENUM}
      actionData={DISCOUNT_ACTION_ENUM}
      type={props.type}
      moneyPrecisionType='dpSupplierSettle'
      onAdd={handleDiscountAdd}
      onDel={handleDiscountDel}
    />
  )
})

export default Discount
