import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  ControlledFormItem,
  FormButton,
  Button,
  BoxFormMore,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import DateRangeFilter from '@/common/components/date_range_filter'
import SearchFilter from '../../components/search_filter'
import { dateFilterData } from '../../../../util'
import type { F as FilterOptions } from '../interface'
import { ListOrderDetailRequest } from 'gm_api/src/order'
import OrderTypeFilter from '@/pages/order/order_manage/list/components/order_type_filter'
import globalStore from '@/stores/global'

interface FilterProps {
  onSearch: (params?: any) => Promise<ListOrderDetailRequest>
}
const Filter: FC<FilterProps> = (props) => {
  const handleSearch = () => {
    props.onSearch()
  }

  function handleReset() {
    store.initFilter()
  }

  useEffect(() => handleReset, [])

  useEffect(() => {
    store.fetchCategory()
  }, [])

  function handleFilterChange<T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ) {
    store.updateFilter(key, value)
  }

  const handleDateChange = (value: {
    begin?: Date
    end?: Date
    dateType?: number
  }) => {
    if (value.dateType) {
      handleFilterChange('dateType', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin', value.begin)
      handleFilterChange('end', value.end)
    }
  }

  return (
    <BoxForm<FilterOptions>
      labelWidth='100px'
      colWidth='385px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        <Observer>
          {() => {
            const { begin, end, dateType } = store.filter
            return (
              <DateRangeFilter
                data={dateFilterData}
                value={{ begin, end, dateType }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <ControlledFormItem>
          <Observer>
            {() => (
              <SearchFilter
                type='view_sku'
                value={{
                  serial_no: store.filter.serial_no,
                  receive_customer_id: store.filter.receive_customer_id,
                  sku_q: store.filter.sku_q,
                }}
                onChange={handleFilterChange}
              />
            )}
          </Observer>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <ControlledFormItem label={t('订单类型')} hide={globalStore.isLite}>
          <Observer>
            {() => (
              <OrderTypeFilter
                value={store.filter.customize_type_ids}
                onChange={(v) => handleFilterChange('customize_type_ids', v)}
              />
            )}
          </Observer>
        </ControlledFormItem>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <>
            <Button onClick={handleReset} className='gm-margin-left-10'>
              {t('重置')}
            </Button>
          </>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
