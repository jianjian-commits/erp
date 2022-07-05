import { t } from 'gm-i18n'
import React, { FC, ChangeEvent } from 'react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Input,
  Button,
} from '@gm-pc/react'
import { observer } from 'mobx-react'

import store from '../store'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  const {
    filter: { search_text },
  } = store

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim()
    store.updateFilter('search_text', value)
  }

  return (
    <BoxForm labelWidth='80px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem>
          <Input
            placeholder={t('输入工序类型名称搜索')}
            value={search_text}
            onChange={handleInputChange}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
