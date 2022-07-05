import {
  ControlledFormItem,
  Form,
  FormBlock,
  FormItem,
  Input,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import { Observer, observer } from 'mobx-react'
import React, { FC } from 'react'
import '../../style.less'
import {
  AppointTimeSettingType,
  CreateTaskInfo,
  ProductPlanType,
} from '../interface'
import store from '../store'
import _ from 'lodash'
import { AppointTimeSettingsTypeArray } from '@/pages/production/create/enum'
import '../style.less'

const Info: FC<ProductPlanType> = observer(() => {
  const handleChange = <T extends keyof CreateTaskInfo>(
    key: T,
    value: CreateTaskInfo[T],
  ) => {
    store.updateCreateTaskInfo(key, value)
    // 选择客户和选择生产模式时调用
    if (key === 'target_customer') {
      let selectedValue: any
      if (selectedValue instanceof Object) {
        selectedValue = value
      } else selectedValue = null
      store.getListBomSku(value)
    }
  }

  const rspTemplate = (data: AppointTimeSettingType) => {
    const { value, text } = data
    return (
      <>
        <ControlledFormItem label={t(`${text}备注`)}>
          <Observer>
            {() => {
              const { batch } = store.taskInfo
              return (
                <Input
                  value={batch?.[value]}
                  placeholder={t(`请填写${text}备注`)}
                  onChange={(e) =>
                    handleChange('batch', {
                      ...batch,
                      [value]: e.target.value,
                    })
                  }
                  maxLength={128}
                />
              )
            }}
          </Observer>
        </ControlledFormItem>
      </>
    )
  }

  return (
    <Form labelWidth='120px' colWidth='400px'>
      <FormBlock col={3}>
        {_.map(AppointTimeSettingsTypeArray, (v) => rspTemplate(v))}
      </FormBlock>
      <FormBlock>
        <FormItem label={t('关联客户')} colWidth='500px'>
          <MoreSelect_Customer
            params={{ level: 2, type: 2 }}
            selected={store.taskInfo.target_customer}
            style={{ width: '272px' }}
            onSelect={(selected: MoreSelectDataItem<string>) => {
              handleChange('target_customer', selected)
            }}
            placeholder={t('输入客户名称查找')}
          />
        </FormItem>
      </FormBlock>
    </Form>
  )
})

export default Info
