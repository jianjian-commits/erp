import React, { FC } from 'react'
import {
  BoxForm,
  Input,
  FormButton,
  Button,
  ControlledFormItem,
} from '@gm-pc/react'
import storeList from '../store/storeList'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { DeviceStrategyFilter } from '../interface'

const Filter: FC<{ onSearch: () => {} }> = ({ onSearch }) => {
  const { text } = storeList.filter
  const handleChange = <T extends keyof DeviceStrategyFilter>(
    name: T,
    value: DeviceStrategyFilter[T],
  ) => {
    storeList.changeFilter(name, value)
  }

  return (
    <BoxForm onSubmit={onSearch} colWidth='280px'>
      <ControlledFormItem label={t('策略')}>
        <Input
          type='text'
          placeholder={t('输入策略ID/策略名称')}
          value={text}
          onChange={(e) => handleChange('text', e.target.value)}
        />
      </ControlledFormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
