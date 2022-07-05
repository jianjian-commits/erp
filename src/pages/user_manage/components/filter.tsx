import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Input,
} from '@gm-pc/react'
import store from '../store'
import { FilterOptions } from '../type'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  // useEffect(() => {
  //   onSearch && onSearch()
  // }, [])

  const {
    filter: { q },
  } = store
  const handleSearch = (): void => {
    onSearch()
  }
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof FilterOptions,
  ): void => {
    const value = event.target.value.trim()
    store.updateFilter(value, key)
  }

  return (
    <BoxForm labelWidth='65px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <FormItem labelWidth='auto' label={t('搜索')}>
          <Input
            placeholder={t('输入用户名，用户ID进行搜索')}
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange(e, 'q')
            }
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
