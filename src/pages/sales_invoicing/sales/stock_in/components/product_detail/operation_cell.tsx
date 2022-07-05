import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../../stores/list_store'
import { canDeleteReceipt, canEdit } from '@/pages/sales_invoicing/util'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'

interface Props {
  index: number
}

const Operation: FC<Props> = (props) => {
  const { index } = props
  const { isEdit, sheet_status } = store.list[index]
  function handleEdit() {
    store.changeListItem('isEdit', true, index)
  }
  function handleCancel() {
    store.doRequest()
  }
  function handleSave() {
    store.updateListItem(index).then(() => {
      store.doRequest()

      return null
    })
  }

  function handleDelete() {
    store.changeListItem('sheet_status', RECEIPT_STATUS.deleted, index)
    store.deleteStockSheet(index).then(() => {
      store.doRequest()

      return null
    })
  }

  // 编辑状态下不判断sheet_status
  return isEdit || (canDeleteReceipt(sheet_status) && canEdit(sheet_status)) ? (
    <TableXUtil.OperationCellRowEdit
      isEditing={!!isEdit}
      onClick={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {canDeleteReceipt(sheet_status) && (
        <TableXUtil.OperationDelete title={t('警告')} onClick={handleDelete}>
          {t('确认删除该退货入库明细') + '？'}
        </TableXUtil.OperationDelete>
      )}
    </TableXUtil.OperationCellRowEdit>
  ) : (
    <div>-</div>
  )
}

export default observer(Operation)
