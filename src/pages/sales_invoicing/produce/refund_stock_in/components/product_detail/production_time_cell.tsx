import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gm-pc/keyboard'
import store, { PDetail } from '../../stores/receipt_store'
import { t } from 'gm-i18n'

import { TableXUtil } from '@gm-pc/table-x'
import { getDateByTimestamp, getTimestamp } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const ProductionTimeCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { production_time } = data

  const handleChangeProductionTime = (value: Date | null) => {
    const changeData = { production_time: getTimestamp(value) }

    store.changeProductDetailsItem(index, changeData)
  }

  return (
    <KCDatePicker
      style={{ width: TABLE_X.WIDTH_DATE }}
      placeholder={t('请选择生产日期')}
      date={getDateByTimestamp(production_time)}
      onChange={handleChangeProductionTime}
    />
  )
})

export default ProductionTimeCell
