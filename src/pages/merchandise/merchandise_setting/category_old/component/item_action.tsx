import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Button, Flex, Popover } from '@gm-pc/react'
import PopConfirm from './pop_confirm'
import AddSubclassInput from './add_subclass_input'
import { itemActionOptions } from '../../../manage/interface'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const ItemActions: FC<itemActionOptions> = ({
  value,
  onCreateSpu,
  onChangeName,
  onAddSubclass,
  onHighlight,
  renderDelete,
}) => {
  const option = {
    0: t('新建二级分类'),
    1: t('新建品类'),
    2: t('新建商品'),
  }
  const title = option[value.level]

  return (
    <Flex alignCenter>
      {value.level === 2 ? (
        <Button type='link' onClick={() => onCreateSpu(value)}>
          {t('新建商品')}
        </Button>
      ) : (
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY}
        >
          <Popover
            popup={
              <PopConfirm
                value={value}
                title={title}
                content={<AddSubclassInput onChange={onChangeName} />}
                onOkText={t('保存')}
                onOkType='primary'
                onOk={() => onAddSubclass(value)}
                onHighlight={onHighlight}
              />
            }
            right
            ref={(ref) => (value.addRef = ref)}
            offset={-10}
          >
            <Button type='link'>{title}</Button>
          </Popover>
        </PermissionJudge>
      )}
      <PermissionJudge
        permission={Permission.PERMISSION_MERCHANDISE_DELETE_CATEGORY}
      >
        <div style={{ color: '#ccc' }}>|</div>
        <Popover
          popup={renderDelete(value)}
          right
          ref={(ref) => (value.deleteRef = ref)}
          offset={-10}
        >
          <Button type='link'>{t('删除')}</Button>
        </Popover>
      </PermissionJudge>
    </Flex>
  )
}

export default ItemActions
