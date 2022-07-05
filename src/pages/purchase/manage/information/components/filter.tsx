import React from 'react'
import { t } from 'gm-i18n'
import { BoxForm, FormItem, FormButton, Button, Input } from '@gm-pc/react'
import { Observer } from 'mobx-react'
import store from '../store'

import type { F } from '../store'

const Filter = () => {
  function handleSearch() {
    store.fetchPurchaser()
  }
  function handleFilterChange<T extends keyof F>(key: T, value: F[T]) {
    store.updateFilter(key, value)
  }

  return (
    <BoxForm inline onSubmit={handleSearch}>
      <FormItem label={t('搜索')}>
        <Observer>
          {() => (
            <Input
              type='text'
              value={store.filter.q}
              placeholder={t('采购员姓名或账号')}
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
