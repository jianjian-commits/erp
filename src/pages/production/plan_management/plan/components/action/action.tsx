import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { Button } from 'antd'
import './style.less'

interface Props {
  editDisabled?: boolean
  deleteDisabled?: boolean
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onClose: () => void
  onDelete: () => void
}

const Action: FC<Props> = ({
  isEditing,
  onEdit,
  onSave,
  onClose,
  onDelete,
  editDisabled,
  deleteDisabled,
}) => {
  const handleEdit = () => {
    onEdit()
  }

  const handleClose = () => {
    onClose()
  }

  const handleSave = () => {
    onSave()
  }

  const handleDelete = () => {
    onDelete()
  }
  return (
    <Flex justifyAround className='b-action'>
      {isEditing ? (
        <>
          <Button type='primary' onClick={handleSave}>
            {t('保存')}
          </Button>
          <Button onClick={handleClose}>{t('取消')}</Button>
        </>
      ) : (
        <>
          <Button type='link' disabled={editDisabled} onClick={handleEdit}>
            {t('编辑')}
          </Button>
          <Button type='link' disabled={deleteDisabled} onClick={handleDelete}>
            {t('删除')}
          </Button>
        </>
      )}
    </Flex>
  )
}

export default Action
