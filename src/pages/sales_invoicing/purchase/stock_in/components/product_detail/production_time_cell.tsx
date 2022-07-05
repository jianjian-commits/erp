import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCDatePicker } from '@gm-pc/keyboard'
import store, { PDetail } from '../../stores/receipt_store1'
import { t } from 'gm-i18n'
import { isInShareV2 } from '../../../../util'
import { DetailStore } from '../../stores'

import { TableXUtil } from '@gm-pc/table-x'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
} from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const ProductionTimeCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { apportionList } = DetailStore
  const { production_time, sku_id } = data

  const handleChangeProductionTime = (value: Date | null) => {
    const changeData = { production_time: getTimestamp(value) }

    DetailStore.changeProductItem(index, changeData)
  }

  return isInShareV2(apportionList, sku_id) ? (
    <div>{getFormatTimeForTable('YYYY-MM-DD', production_time)}</div>
  ) : (
    <KCDatePicker
      style={{ width: TABLE_X.WIDTH_DATE }}
      placeholder={t('请选择生产日期')}
      date={getDateByTimestamp(production_time)}
      onChange={handleChangeProductionTime}
    />
  )
})

export default ProductionTimeCell
