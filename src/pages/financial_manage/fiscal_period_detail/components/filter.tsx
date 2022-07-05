import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  BoxFormMore,
  FormButton,
  Button,
  Select,
} from '@gm-pc/react'
import CategoryFilter from '@/common/components/category_filter_hoc'

import store from '../store'
import type { FilterType } from '../store'
import globalStore from '@/stores/global'

interface ChangeFilter {
  onSearch: () => any
}

const Filter: FC<ChangeFilter> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { q, category },
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

  const InStockData = [
    {
      value: 0,
      text: '总库存',
    },
  ]

  return (
    <BoxForm labelWidth='90px' onSubmit={handleSubmit} colWidth='390px'>
      <FormBlock col={3}>
        <FormItem label={t('按仓库查询')} colWidth='300px'>
          <Select
            placeholder={t('请选择仓库')}
            className='tw-w-40 tw-mr-3'
            data={InStockData}
            value={0}
          />
        </FormItem>
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
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('商品筛选')}>
            <CategoryFilter
              disablePinLei
              selected={category}
              onChange={(e) => handleFilterChange('category', e)}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
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
