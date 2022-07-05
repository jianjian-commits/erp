import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  Select,
  DateRangePicker,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import FilterButton from '@/common/components/filter_button'
import store from '../store'
import CustomerFilter from './customer_filter'
import type { FilterOptions } from '../interface'
import { Credit_Type } from '../../../enum'
import globalStore from '@/stores/global'

interface Props {
  onSearch: () => Promise<any>
}

const Filter: FC<Props> = ({ onSearch }) => {
  const handleFilterChange = <T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ) => {
    store.updateFilter(key, value)
  }

  useEffect(() => {
    store.fetchDriverList()
  }, [])

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  return (
    <BoxForm labelWidth='85px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按建单时间')}>
          <Observer>
            {() => {
              const { begin_time, end_time } = store.filter
              return (
                <DateRangePicker
                  begin={begin_time}
                  end={end_time}
                  onChange={(begin: Date, end: Date) => {
                    if (begin && end) {
                      handleFilterChange('begin_time', begin)
                      handleFilterChange('end_time', end)
                    }
                  }}
                  enabledTimeSelect
                  // timeSpan={60 * 60 * 1000}
                />
              )
            }}
          </Observer>
        </FormItem>

        {/* <FormItem label={t('搜索')}>
          <Observer>
            {() => {
              const { search_text } = store.filter
              return (
                <Input
                  value={search_text}
                  onChange={(e) =>
                    handleFilterChange('search_text', e.target.value)
                  }
                  placeholder={t('请输入公司名或对账单号')}
                />
              )
            }}
          </Observer>
        </FormItem> */}
        <FormItem label={t('公司筛选')}>
          <Observer>
            {() => (
              <CustomerFilter
                value={store.filter.customers}
                onChange={(v) => handleFilterChange('customers', v)}
              />
            )}
          </Observer>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('结款周期')}>
            <Observer>
              {() => {
                const { credit_type } = store.filter
                return (
                  <Select
                    all
                    data={Credit_Type}
                    value={credit_type}
                    onChange={(value) =>
                      handleFilterChange('credit_type', value)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FilterButton onExport={handleExport} />
    </BoxForm>
  )
}

export default observer(Filter)
