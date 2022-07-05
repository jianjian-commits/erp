import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  MoreSelect,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import store from '../store'
import type { FilterOption } from '../store'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { TimeType } from 'gm_api/src/aftersale'
import { Select_CustomerLabel } from 'gm_api/src/enterprise/pc'
import CustomerFilter from './customer_filter'
import globalStore from '@/stores/global'
// import SearchFilter from './search_filter'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_PLACE_ORDER,
    name: '按下单日期',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_RECEIVE_GOODS,
    name: '按收货日期',
    expand: false,
  },
]

const Filter = () => {
  const {
    filter: { begin_time, end_time, time_type, merchants_id, quotation_ids },
    quotationList,
  } = store
  const handleSearch = () => {
    store.fetchReportList()
  }
  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  const handleFilterChange = <T extends keyof FilterOption>(
    key: T,
    value: FilterOption[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.updateFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.updateFilter('begin_time', value.begin)
      store.updateFilter('end_time', value.end)
    }
  }

  useEffect(() => {
    store.fetchQuotationList()
  }, [])

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{ begin: begin_time, end: end_time, dateType: time_type }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        {/* <FormItem>
          <Observer>
            {() => {
              const { customer_id, customer_name } = store.filter
              return (
                <SearchFilter
                  value={{
                    customer_id: customer_id || '',
                    customer_name: customer_name || '',
                  }}
                  onChange={(key, value) => {
                    handleFilterChange(key, value)
                  }}
                />
              )
            }}
          </Observer>
        </FormItem> */}
        <FormItem label={t('商户筛选')}>
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
          <FormItem label={t('商户标签')}>
            <Select_CustomerLabel
              all={{ value: '', text: t('全部') }}
              value={merchants_id!}
              onChange={(value: string) => {
                handleFilterChange('merchants_id', value)
              }}
            />
          </FormItem>
          <FormItem label={t('报价单')}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              placeholder={t('全部报价单')}
              data={quotationList}
              selected={quotation_ids}
              onSelect={(selected: any) => {
                handleFilterChange('quotation_ids', selected)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button
          type='default'
          onClick={handleExport}
          className='gm-margin-left-10'
        >
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
