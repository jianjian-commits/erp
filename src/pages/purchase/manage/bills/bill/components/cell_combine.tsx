import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { RightSideModal } from '@gm-pc/react'
// import PurchasePlan from './purchase_plan'
import PlanDetail from './plan_detail'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'

const CellCombine: FC<{ index: number }> = ({ index }) => {
  const bill = store.list[index]

  const handlePurchasePlan = () => {
    const purchase_task_id = _.get(bill, 'purchase_task_ids[0]', '')
    const {
      name = '-',
      plan_amount,
      purchase_task_serial_no = '-',
      purchase_unit_name,
    } = bill

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '900px', overflowY: 'auto' },
      children: (
        <PlanDetail
          purchase_task_id={purchase_task_id}
          product_name={name}
          quantity={`${plan_amount}${purchase_unit_name}`}
          purchase_task_serial_no={purchase_task_serial_no}
        />
      ),
    })
  }
  return (
    <div>
      {bill.purchase_task_serial_no ? (
        <div className='gm-text-primary gm-cursor' onClick={handlePurchasePlan}>
          {bill.purchase_task_serial_no}
        </div>
      ) : (
        '-'
      )}
    </div>
  )
}

export default observer(CellCombine)
