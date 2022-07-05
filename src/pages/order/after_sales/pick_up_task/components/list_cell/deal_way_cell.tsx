import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { dealWay, dealWayMap } from '../../enum'
import store from '../../store'
import type { ListOptions } from '../../interface'

const DealWayCell: FC<{ order?: ListOptions; index: number }> = ({ index }) => {
  const order = store.list[index]
  const { task_method } = order
  const handleChange = (value: number) => {
    store.updateListColumn(index, 'task_method', value)

    // 如果 deal_way === 1 将取货数设置为0；
    // deal_way === 2 重置取货数为申请退货数,取不到deal_way最新值，取反设置
    if (task_method === 1) {
      store.updateListColumn(index, 'apply_return_amount', '0')
    } else {
      store.updateListColumn(
        index,
        'apply_return_amount',
        order.apply_return_amount,
      )
    }
  }

  if (order.isEditing) {
    return (
      <Select
        value={order.task_method}
        style={{ minWidth: '70px' }}
        data={dealWay}
        onChange={(value: number) => handleChange(value)}
        placeholder={t('请选择')}
      />
    )
  } else {
    return <div>{dealWayMap[order?.task_method!] || t('-')}</div>
  }
}

export default observer(DealWayCell)
