import { observer } from 'mobx-react'
import React from 'react'
import { StockSheet_RelatedSheetType } from 'gm_api/src/inventory'

const SettleTip = observer((props: any) => {
  const { text, id, tip, type } = props
  let href

  switch (type) {
    case StockSheet_RelatedSheetType.RELATED_SHEET_TYPE_PURCHASE_SHEET:
      href = `#/purchase/manage/bills/detail?id=${id}`
      break
    default:
      href = `#/financial_manage/supplier_settlement/supplier_settlement/paid_receipt/detail?sheet_id=${id}`
      break
  }

  return (
    <>
      {`${tip}`}
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='gm-cursor'
      >
        {text}
      </a>
      ，仅供参考，请根据实际情况修改入库商品信息
    </>
  )
})

export default SettleTip
