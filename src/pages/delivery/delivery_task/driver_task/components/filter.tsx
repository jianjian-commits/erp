import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  FormButton,
  Button,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import store, { FilterType } from '../store'

interface FilterProps {
  onSearch: () => Promise<any>
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

const Filter: FC<FilterProps> = ({ onSearch }) => {
  const {
    filter: { begin_time, end_time, time_type, search_text },
  } = store

  useEffect(() => {
    onSearch && onSearch()
  }, [])
  const handleSearch = () => {
    onSearch()
  }

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.changeFilter(key, value)
  }
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      handleFilterChange('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{
            begin: begin_time,
            end: end_time,
            dateType: time_type,
          }}
          enabledTimeSelect
          onChange={handleDateChange}
        />
        <FormItem label={t('搜索')}>
          <Observer>
            {() => {
              return (
                <Input
                  value={search_text}
                  onChange={(e) =>
                    handleFilterChange('search_text', e.target.value)
                  }
                  placeholder={t('请输司机名称')}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
