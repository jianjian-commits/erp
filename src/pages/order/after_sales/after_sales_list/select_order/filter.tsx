import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import { FormItem, Input, FormBlock, BoxForm } from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'
import store from '../store/select_order_store'
import FilterButton from '@/common/components/filter_button'

import CustomerFilter from '../components/customer_filter'

const dateFilterData = [
  {
    type: 1,
    name: t('按下单时间'),
    expand: false,
  },
  {
    type: 2,
    name: t('按收货时间'),
    expand: false,
  },
]

interface FilterProps {
  onSearch?: () => Promise<any>
}
const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.updateFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.updateFilter('begin_time', value.begin)
      store.updateFilter('end_time', value.end)
    }
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' inline onSubmit={onSearch}>
      <FormBlock col={2}>
        <Observer>
          {() => {
            const {
              filter: { begin_time, end_time, time_type },
            } = store
            return (
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
            )
          }}
        </Observer>
        <FormItem label={t('商户')}>
          <Observer>
            {() => {
              const { receive_customer_ids } = store.filter
              return (
                <CustomerFilter
                  value={receive_customer_ids!}
                  onChange={(selected) => {
                    store.updateFilter('receive_customer_ids', selected)
                  }}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-top-20'>
        <FormItem label={t('搜索')}>
          <Observer>
            {() => {
              const { search_text } = store.filter
              return (
                <Input
                  value={search_text}
                  onChange={(e) => {
                    store.updateFilter('search_text', e.target.value)
                  }}
                  placeholder={t('请输入订单号')}
                />
              )
            }}
          </Observer>
        </FormItem>
        {/* 可能不需要 */}
        <FilterButton />
      </FormBlock>
    </BoxForm>
  )
})

export default Filter
