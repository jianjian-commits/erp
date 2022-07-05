import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { RightSideModal, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import { ProductionPlanSelect } from '@/pages/sales_invoicing/components'
import store, { PDetail } from '../../stores/receipt_store'

import { isValid } from '@/common/util'

import { getDataByRecommend } from '../../util'
import Big from 'big.js'
import { backEndDp } from '@/pages/sales_invoicing/util'

interface Props {
  index: number
  data: PDetail
}

const verifyPlan = (data: any[]) => {
  let isPlanValid = true
  if (data.length !== 1) {
    isPlanValid = false
    Tip.danger(t('需要关联一条生产需求'))
  }
  return isPlanValid
}

const BatchDetailCell: FC<Props> = observer(({ index, data }) => {
  const {
    sku_id,
    production_task_id,
    production_task_serial_no,
    input_stock: { input },
  } = data

  const { customerList } = store
  const is_has_selected =
    isValid(production_task_id) && production_task_id !== '0'

  const handlePlan = () => {
    if (!sku_id || !input?.quantity) {
      Tip.danger(t('请先填写商品、入库数（基本单位）'))
      return
    }
    RightSideModal.render({
      children: (
        <ProductionPlanSelect
          selectKey='task_id'
          defaultFilter={{ sku_ids: [sku_id] }}
          onEnsure={(planData): any => {
            if (verifyPlan(planData)) {
              const {
                input_stock: { input },
              } = data
              /** 总额 */
              const amount = +Big(planData?.cost || 0).toFixed(backEndDp)
              /** 均价 */
              const base_price =
                !_.isNil(input?.quantity) && _.toNumber(input?.quantity) // 0直接为0吧
                  ? +Big(amount ?? 0)
                      .div(input?.quantity ?? 1)
                      .toFixed(backEndDp)
                  : 0

              const target_customer_name =
                planData[0].target_customer_id &&
                planData[0].target_customer_id !== '0'
                  ? _.find(
                      customerList,
                      (item) => item.value === planData[0].target_customer_id,
                    )?.name
                  : ''
              store.changeProductDetailsItem(index, {
                amount,
                base_price,
                target_customer_name,
                production_task_id: planData[0]?.task_id,
                production_task_serial_no: planData[0]?.serial_no,
                target_customer_id: planData[0].target_customer_id,
              })
              RightSideModal.hide()
            }
          }}
          onCancel={() => {
            RightSideModal.hide()
          }}
          production_task_id={production_task_id}
        />
      ),
      title: t('选择生产需求'),
      opacityMask: true,
      style: {
        width: '1000px',
      },
      onHide: RightSideModal.hide,
    })
  }

  return (
    <a onClick={handlePlan} className='gm-cursor'>
      {is_has_selected ? production_task_serial_no : t('选择生产需求')}
    </a>
  )
})

export default BatchDetailCell
