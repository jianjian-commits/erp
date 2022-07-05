import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Select } from '@gm-pc/react'
import {
  TURNOVER_LEND_STATUS,
  TURNOVER_RETURN_STATUS,
  TURN_OVER_LEND_STATUS_NAME,
  TURN_OVER_RETURN_STATUS_NAME,
  RECEIPT_STATUS,
} from '@/pages/sales_invoicing/enum'
import { StockSheetInfo } from '../../interface'

interface Props {
  index: number
  updateSheetInfo: <T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) => any
  data: StockSheetInfo
  type: string
}

const SheetStatus: FC<Props> = (props) => {
  const {
    index,
    type,
    updateSheetInfo,
    data: { sheet_status, edit },
  } = props
  const ifLend = type === 'lend'
  const STATUS = ifLend ? TURNOVER_LEND_STATUS : TURNOVER_RETURN_STATUS
  const NAME = ifLend
    ? TURN_OVER_LEND_STATUS_NAME
    : TURN_OVER_RETURN_STATUS_NAME
  return (
    <>
      {edit ? (
        <Select
          value={sheet_status}
          data={STATUS.filter((v) => v.value !== RECEIPT_STATUS.deleted)}
          onChange={(value) => updateSheetInfo(index, 'sheet_status', value)}
        />
      ) : (
        NAME[sheet_status]
      )}
    </>
  )
}

export default observer(SheetStatus)
