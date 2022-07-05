import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gm-pc/keyboard'
import store from '../../stores/detail_store'
import { t } from 'gm-i18n'
import { getDateByTimestamp, getTimestamp } from '@/common/util'

import { TableXUtil } from '@gm-pc/table-x'

const { TABLE_X } = TableXUtil

interface timeProps {
  data: any
  index: number
}

const ProductionTimeCell: FC<timeProps> = observer((props) => {
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
