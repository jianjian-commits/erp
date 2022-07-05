import { Select } from '@gm-pc/react'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store, { PDetail } from '../../stores/list_store'
import { SALES_IN_STOCK_STATUS_NAME } from '../../enum'
import { getEnumText } from '@/common/util'

interface Props {
  data: PDetail
  index: number
}

const StockStatusCell: FC<Props> = observer((props) => {
  const { index } = props
  const { isEdit, sheet_status } = store.list[index]

  const handleChange = (value: number) => {
    store.changeListItem('sheet_status', value, index)
  }
  return isEdit ? (
    <Select
      data={SALES_IN_STOCK_STATUS_NAME}
      value={sheet_status}
      onChange={handleChange}
    />
  ) : (
    <div>{getEnumText(SALES_IN_STOCK_STATUS_NAME, sheet_status)}</div>
  )
})

export default StockStatusCell
