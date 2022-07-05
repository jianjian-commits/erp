import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { DatePicker } from '@gm-pc/react'
import store from '../store'
import { t } from 'gm-i18n'
import { getDateByTimestamp, getTimestamp } from '@/common/util'

import { TableXUtil } from '@gm-pc/table-x'

const { TABLE_X } = TableXUtil

const ProductionTimeCell: FC<any> = observer(({ index }) => {
  const order = store.orders[index]

  const handleChangeProductionTime = (value: Date | null) => {
    store.changeOrderItem(index, {
      receive_time: getTimestamp(value),
    })
  }

  return (
    <DatePicker
      style={{ width: TABLE_X.WIDTH_SEARCH }}
      placeholder={t('请选择收货日期')}
      date={getDateByTimestamp(order.receive_time)}
      onChange={handleChangeProductionTime}
      enabledTimeSelect
    />
  )
})

export default ProductionTimeCell
