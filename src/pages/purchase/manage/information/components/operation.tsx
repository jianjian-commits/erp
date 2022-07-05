import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../store'
import { gmHistory as history } from '@gm-common/router'
import { DeleteGroupUser, UpdateGroupUser } from 'gm_api/src/enterprise'
import { Tip } from '@gm-pc/react'

interface OperationProps {
  index: number
  editDisabled?: boolean
  deleteDisabled?: boolean
}
const Operation: FC<OperationProps> = ({
  index,
  editDisabled,
  deleteDisabled,
}) => {
  const { isEditing, group_user_id } = store.list[index]
  function handleDetail() {
    history.push(`/purchase/manage/information/detail?id=${group_user_id}`)
  }

  function handleDelete() {
    DeleteGroupUser({ group_user_id: group_user_id }).then(() => {
      store.fetchPurchaser()
      return null
    })
  }
  function handleModify() {
    store.updateListItem(index, 'isEditing', true)
  }
  function handleCancel() {
    store.updateListItem(index, 'isEditing', false)
  }
  function handleSave() {
    const user = store.list[index]
    return UpdateGroupUser({
      group_user: {
        ...user,
      },
    }).then(() => {
      Tip.success(t('更新成功'))
      store.fetchPurchaser()
      return null
    })
  }
  return (
    <TableXUtil.OperationCellRowEdit
      disabled={editDisabled}
      isEditing={!!isEditing}
      onClick={handleModify}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      <TableXUtil.OperationDetail onClick={handleDetail} />
      <TableXUtil.OperationDelete
        disabled={deleteDisabled}
        title={t('警告')}
        onClick={handleDelete}
      >
        {t('将解除此采购员与供应商的绑定关系，确定删除吗？')}
      </TableXUtil.OperationDelete>
    </TableXUtil.OperationCellRowEdit>
  )
}

export default observer(Operation)
