import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  FormButton,
  Button,
} from '@gm-pc/react'
import CategoryFilter from '@/common/components/category_filter_hoc'

import store from '../store'
import type { FilterType } from '../store'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface ChangeFilter {
  onSearch: () => any
}

const Filter: FC<ChangeFilter> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { q, category, warehouse_id },
  } = store

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleSubmit = () => {
    onSearch()
  }

  const handleExport = (): void => {
    store.export().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <BoxForm labelWidth='90px' onSubmit={handleSubmit} colWidth='390px'>
      <FormBlock col={3}>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('按仓库查询')} colWidth='300px'>
            <Select_WareHouse_Default
              onChange={(value) => handleFilterChange('warehouse_id', value)}
              value={warehouse_id}
            />
          </FormItem>
        )}
        <FormItem label={t('商品筛选')}>
          <CategoryFilter
            disablePinLei
            selected={category}
            onChange={(e) => handleFilterChange('category', e)}
          />
        </FormItem>

        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            placeholder={t('请输入商品名字或者名称')}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
