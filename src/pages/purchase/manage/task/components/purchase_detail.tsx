import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import OverView from './overview'
import globalStore from '@/stores/global'
import { Task } from '../store'
import { observer } from 'mobx-react'
import Big from 'big.js'
import _ from 'lodash'
import { toFixed } from '@/common/util'

interface PurchaseDetailProps {
  task: Task
  planValue: string | number
  needValue: string | number
}

const PurchaseDetail: FC<PurchaseDetailProps> = observer(
  ({ task, planValue, needValue }) => {
    const unit_name =
      globalStore.getUnitName(task.sku?.purchase_unit_id!) ||
      globalStore.getPurchaseUnitName(
        task.sku?.units?.units,
        task.sku?.purchase_unit_id!,
      ) ||
      '-'
    return (
      <Flex column className='gm-padding-20'>
        <Flex className='gm-back-bg' flex={3}>
          <OverView name={t('计划采购数')} value={planValue + unit_name} />
          <OverView name={t('需求数')} value={needValue + unit_name} />
          <OverView
            name={t('已采购数')}
            value={
              (task.purchase_value?.input?.quantity
                ? toFixed(Big(task.purchase_value?.input?.quantity))
                : '-') + unit_name
            }
            color='#56a3f2'
          />
        </Flex>
      </Flex>
    )
  },
)

export default PurchaseDetail
