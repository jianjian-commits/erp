import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { Space, Button } from 'antd'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
interface TreeTitleProps {
  handleEdit: () => void
  handleCreate: () => void
  handleDelete: () => void
  handleLook: () => void
  title: string
  level: string
}
const TreeTitle: FC<TreeTitleProps> = ({
  handleEdit,
  handleCreate,
  handleDelete,
  handleLook,
  title,
  level,
}) => {
  return (
    <Flex alignCenter justifyBetween>
      <a className='title-tree-title' onClick={handleLook}>
        {title}
      </a>

      <Space size='large'>
        {level === '1' &&
          globalStore.hasPermission(
            Permission.PERMISSION_ENTERPRISE_CREATE_SCHOOL_CLASS,
          ) && (
            <Button onClick={handleCreate} type='primary'>
              {t('新建班级')}
            </Button>
          )}
        {globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_UPDATE_SCHOOL_CLASS,
        ) && <a onClick={handleEdit}>{t('编辑')}</a>}
        {globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_DELETE_SCHOOL_CLASS,
        ) && <a onClick={handleDelete}>{t('删除')}</a>}
      </Space>
    </Flex>
  )
}
export default TreeTitle
