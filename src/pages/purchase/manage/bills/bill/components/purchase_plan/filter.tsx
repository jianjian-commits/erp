import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormItem,
  FormButton,
  Button,
  Input,
  DateRangePicker,
} from '@gm-pc/react'
import { Observer } from 'mobx-react'
import store from './store'

import type { F } from './store'

const Filter = (props: { onSearch: () => void }) => {
  function handleSearch() {
    props.onSearch()
  }

  function handleFilterChange<T extends keyof F>(key: T, value: F[T]) {
    store.updateFilter(key, value)
  }
  function handleChangeRangePick(begin: Date | null, end: Date | null) {
    handleFilterChange('begin', begin)
    handleFilterChange('end', end)
  }

  return (
    <BoxForm inline onSubmit={handleSearch}>
      <FormItem label={t('计划交期')} colWidth='380px'>
        <Observer>
          {() => (
            <DateRangePicker
              begin={store.filter.begin}
              end={store.filter.end}
              enabledTimeSelect
              onChange={handleChangeRangePick}
            />
          )}
        </Observer>
      </FormItem>
      <FormItem label={t('搜索')}>
        <Observer>
          {() => (
            <Input
              type='text'
              value={store.filter.q}
              placeholder={t('请输入采购计划编号')}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          )}
        </Observer>
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default Filter
