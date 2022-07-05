import { observer } from 'mobx-react'
import React from 'react'
import { t } from 'gm-i18n'

import store from '../stores/receipt_store'

const SettleTip = observer(() => {
  const { settle_sheet_serial_no, settle_sheet_id } = store.receiptDetail
  return (
    <>
      {t('当前出库单关联结款单')}
      <a
        href={`#/financial_manage/supplier_settlement/supplier_settlement/paid_receipt/detail?sheet_id=${settle_sheet_id}`}
        target='_blank'
        rel='noopener noreferrer'
        className='gm-cursor'
      >
        {settle_sheet_serial_no}
      </a>
    </>
  )
})

export default SettleTip
