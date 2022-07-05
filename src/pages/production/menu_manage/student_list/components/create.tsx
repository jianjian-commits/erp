import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Input,
  BoxForm,
  FormBlock,
  FormItem,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { CreateOrBatchData } from '../interface'
import store from '../store'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import ChoseIcon from './chose_icon'

const Create: FC = observer(() => {
  const handleDataChange = <T extends keyof CreateOrBatchData>(
    key: T,
    value: CreateOrBatchData[T],
  ) => {
    store.updateCreateOrBatchData(key, value)
  }
  const handleCreateMealTimes = () => {
    Dialog.render({
      title: t('新建餐次'),
      size: 'md',
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('保存'),
          onClick: () => {
            store.createMealTimes()
          },
          btnType: 'primary',
        },
      ],
      children: (
        <BoxForm labelWidth='100px' colWidth='500px'>
          <FormBlock col={3}>
            <FormItem label={t('餐次名称')}>
              <Observer>
                {() => {
                  const { name } = store.create_or_batch_data
                  return (
                    <Input
                      value={name}
                      onChange={(e) => handleDataChange('name', e.target.value)}
                      placeholder={t('请输入餐次名称')}
                      maxLength={10}
                    />
                  )
                }}
              </Observer>
            </FormItem>
            <FormItem label={t('选择图标')} className='gm-margin-top-20'>
              <ChoseIcon
                iconData={store.icons}
                onSelect={(value) => handleDataChange('icon', value)}
              />
            </FormItem>
          </FormBlock>
        </BoxForm>
      ),
    })
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_MERCHANDISE_CREATE_ESHOP_MENU_PERIOD}
    >
      <Button
        className='gm-margin-right-10'
        type='primary'
        onClick={handleCreateMealTimes}
      >
        {t('新建餐次')}
      </Button>
    </PermissionJudge>
  )
})

export default Create
