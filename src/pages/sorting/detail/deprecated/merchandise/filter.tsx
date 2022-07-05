import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormItem,
  FormBlock,
  FormButton,
  MoreSelectDataItem,
  Button,
} from '@gm-pc/react'

import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { MoreSelect_QuotationV2 } from '@/common/components'

import merchandiseStore from './merchandise_store'
import CategoryFilter from '@/common/components/category_filter_hoc'
import { Filter as SearchFilter } from './interface'

interface FilterProps {
  onSearch: () => void
}

const dateFilterData = [
  {
    type: 1,
    name: '按下单日期',
    expand: false,
  },
  {
    type: 2,
    name: '按收货日期',
    expand: false,
  },
]
const handleFilterChange = (name: keyof SearchFilter, value: any) => {
  merchandiseStore.setFilter(name, value)
}
const Filter: FC<FilterProps> = ({ onSearch }) => {
  // 选择日期
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      handleFilterChange('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  // 搜索
  const handleSearch = () => {
    onSearch()
  }

  const { filter } = merchandiseStore
  const {
    // 时间
    begin_time,
    end_time,
    time_type,

    search,
    category,
    quotation_ids,
  } = filter

  return (
    <BoxForm
      btnPosition='left'
      labelWidth='100px'
      colWidth='385px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{
            begin: begin_time,
            end: end_time,
            dateType: time_type,
          }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        <FormItem label={t('搜索')}>
          <input
            name='orderInput'
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder={t('输入商品名、商品ID')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem col={2} label={t('商品筛选')}>
            <CategoryFilter
              selected={category}
              onChange={(selected) => handleFilterChange('category', selected)}
            />
          </FormItem>
          <FormItem label={t('报价单')}>
            <MoreSelect_QuotationV2
              multiple
              selected={quotation_ids}
              onSelect={(select: MoreSelectDataItem<string>[]) =>
                handleFilterChange('quotation_ids', select)
              }
              renderListFilterType='pinyin'
              getName={(item) => item.inner_name!}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <div className='gm-gap-10' />
          <Button onClick={() => merchandiseStore.reset()}>{t('重置')}</Button>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
