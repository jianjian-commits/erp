import { Flex } from '@gm-pc/react'
import React, { FC } from 'react'

import store from '@/pages/production/plan_management/plan/store'
import { Progress } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Big from 'big.js'
import PlanInfo from '../../plan_info'
import { t } from 'gm-i18n'
import { toFixed } from '@/common/util'

const PlanListItem: FC<{ index: number; onSelect: () => void }> = ({
  index,
  onSelect,
}) => {
  const { plan_amount_sum, output_amount_sum, production_order_id } =
    store.productionPlanList[index]

  return (
    <Flex
      className={classNames('plan-list-item', {
        'plan-list-item-select':
          store.producePlanCondition.productionOrderId === production_order_id,
      })}
      onClick={onSelect}
      column
    >
      <PlanInfo index={index} />
      <div className='gm-progress'>
        <Progress
          percent={Big(+output_amount_sum! || 0)
            .div(+plan_amount_sum! || '1')
            .times(100)
            .toNumber()}
          format={(percent) => (
            <div className='gm-text-12'>
              {`${t('进度')}：${toFixed(percent!, 2)}%`}
            </div>
          )}
        />
      </div>
    </Flex>
  )
}

export default observer(PlanListItem)
