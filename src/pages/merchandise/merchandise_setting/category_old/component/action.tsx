import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, Button, Dialog, Tip, Modal, Input } from '@gm-pc/react'
import AddCategory1 from './add_category1'
import IconsManagement from './icons_manage'
import store from '../store'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const Action: FC = observer(({ onLocation, onAddCategory }) => {
  const {
    icons,
    activeCategory: { name, icon },
  } = store
  const [location, setLocation] = useState('')

  const handleCreateOne = (): void => {
    Dialog.render({
      title: t('新建分类'),
      size: 'md',
      children: (
        <AddCategory1
          icons={icons}
          onChange={(name: string) => store.changeActiveCategory('name', name)}
          onSelected={(icon: string) =>
            store.changeActiveCategory('icon', icon)
          }
        />
      ),
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('保存'),
          btnType: 'primary',
          onClick: () => {
            return store.createCategory(0).then(() => {
              Tip.success(t('新增成功！'))
              store.getCategory()
              Dialog.hide()
            })
          },
        },
      ],
    })
  }

  const handleBatch = (): void => {}

  const handleIcon = (): void => {
    Modal.render({
      title: t('一级分类图标管理'),
      children: <IconsManagement onOk={() => store.getList()} />,
      onHide: Modal.hide,
    })
  }

  const handleFindLocation = () => {
    if (!location) {
      Tip.tip(t('请输入分类名'))
      return
    }
    onLocation(location)
  }

  const handleChangeValue = (value: string) => {
    setLocation(value)
  }

  return (
    <Flex alignCenter>
      <Input
        value={location}
        className='form-control'
        style={{ width: '220px' }}
        placeholder={t('请输入分类名')}
        onChange={(e) => handleChangeValue(e.target.value)}
      />
      <Button type='primary' onClick={handleFindLocation}>
        {t('定位')}
      </Button>

      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <PermissionJudge
        permission={Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY}
      >
        <Button onClick={handleCreateOne} type='primary'>
          {t('新建一级分类')}
        </Button>
      </PermissionJudge>
      {/* <Button */}
      {/*  onClick={handleBatch} */}
      {/*  className='gm-margin-left-10' */}
      {/*  type='primary' */}
      {/* > */}
      {/*  {t('批量导入')} */}
      {/* </Button> */}
      {/* <Button onClick={handleIcon} className='gm-margin-left-10'> */}
      {/*  {t('图标管理')} */}
      {/* </Button> */}
    </Flex>
  )
})

export default Action
