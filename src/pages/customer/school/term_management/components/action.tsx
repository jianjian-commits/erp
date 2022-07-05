import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { message } from 'antd'
import store from '../store/storeList'

import type { TermItemProps } from '../store/storeList'

interface ActionProps {
  index: number
  isEditing: boolean
}

const { OperationCellRowEdit, OperationDelete } = TableXUtil

const Action: FC<ActionProps> = observer(({ index, isEditing }) => {
  const { year, semester_id } = store.termList[index]
  const handleUpdateList = <T extends keyof TermItemProps>(
    name: T,
    value: TermItemProps[T],
  ) => {
    store.updateTermItem(index, name, value)
  }

  const handleEditCancel = () => {
    handleUpdateList('isEditing', false)
    // 重新拉一下数据
    store.fetchListTerm()
  }

  const handleEditSave = () => {
    if (!year) {
      message.error(t('学年不为空'))
    }
    store.fetchUpdateTerm(index).then((json) => {
      if (json.response.semester) {
        message.success(t('修改成功'))
        handleUpdateList('isEditing', false)
        store.fetchListTerm()
      }
      return null
    })
  }

  const handleDelete = () => {
    store.fetchDeleteTerm(semester_id)
  }

  return (
    <OperationCellRowEdit
      isEditing={isEditing}
      onClick={() => handleUpdateList('isEditing', true)}
      onCancel={handleEditCancel}
      onSave={handleEditSave}
    >
      {!isEditing && (
        <OperationDelete title={t('删除学期')} onClick={handleDelete}>
          <div>{t('确定要删除所选学期吗？')}</div>
        </OperationDelete>
      )}
    </OperationCellRowEdit>
  )
})

export default Action
