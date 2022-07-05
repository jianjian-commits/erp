import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'

import store, { PDetail } from '../../stores/list_store'
import { t } from 'gm-i18n'

import { TableXUtil } from '@gm-pc/table-x'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
} from '@/common/util'
import { DatePicker } from '@gm-pc/react'
import { getMinStockTime } from '@/pages/sales_invoicing/util'
import sale_store from '../../../../store'

const { TABLE_X } = TableXUtil
interface Props {
  index: number
}

const StockInTimeCell: FC<Props> = observer((props) => {
  const { index } = props
  const { isEdit, submit_time } = store.list[index]

  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const handleChangeProductionTime = (value: Date | null) => {
    store.changeListItem('submit_time', getTimestamp(value), index)
  }

  return !isEdit ? (
    <div>{getFormatTimeForTable('YYYY-MM-DD', submit_time)}</div>
  ) : (
    <DatePicker
      style={{ width: TABLE_X.WIDTH_DATE }}
      placeholder={t('请选择入库时间')}
      date={getDateByTimestamp(submit_time)}
      onChange={handleChangeProductionTime}
      min={new Date(Number(period_list[0]?.end_time)) || getMinStockTime()}
    />
  )
})

export default StockInTimeCell
