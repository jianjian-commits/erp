import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gm-pc/keyboard'
import store from '../store'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
} from '@/common/util'
import { Flex } from '@gm-pc/react'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
}

const ProductionTimeCell: FC<Props> = observer((props) => {
  const { index } = props
  const { manufacture_date } = store.list[index]

  const { status } = store.info
  const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)
  const handleChangeProductionTime = (value: Date | null) => {
    store.updateRowColumn(index, 'manufacture_date', getTimestamp(value) ?? '')
  }
  if (isCommitted) {
    return <Flex>{getFormatTimeForTable('YYYY-MM-DD', manufacture_date)}</Flex>
  }

  return (
    <KCDatePicker
      style={{ width: TABLE_X.WIDTH_DATE }}
      placeholder={t('请选择生产日期')}
      date={getDateByTimestamp(manufacture_date)}
      onChange={handleChangeProductionTime}
    />
  )
})

export default ProductionTimeCell
