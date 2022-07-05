import React from 'react'
// import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
// import SVGShare from '@/svg/share.svg'
import store from '../store'
import { DeletePurchaseSheet, PurchaseSheet_Status } from 'gm_api/src/purchase'

interface OperationProps {
  index: number
  deleteDisabled: boolean
}

const Operation = (props: OperationProps) => {
  const bill = store.list[props.index]

  const handleDel = () => {
    return DeletePurchaseSheet({
      purchase_sheet_ids: [bill.purchase_sheet_id!],
    }).then(() => {
      store.doRequest()
    })
  }

  return (
    <TableXUtil.OperationCell>
      {/* <TableXUtil.OperationIcon onClick={handleShareQrcode} tip={t('分享')}>
        <SVGShare />
      </TableXUtil.OperationIcon> */}
      {bill.status < PurchaseSheet_Status.COMMIT && (
        <TableXUtil.OperationDelete
          disabled={props.deleteDisabled}
          title='警告'
          onClick={handleDel}
        >
          {`确认删除${bill.purchase_sheet_id!}`}
        </TableXUtil.OperationDelete>
      )}
    </TableXUtil.OperationCell>
  )
}

export default observer(Operation)
