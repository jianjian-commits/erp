import React, { FC } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import {
  BoxForm,
  BoxFormMore,
  Select,
  FormItem,
  FormBlock,
  FormButton,
  Button,
  MoreSelectDataItem,
} from '@gm-pc/react'
import {
  SORTING_STATUS_LIST,
  SORT_STATUS_ORDER,
  ORDER_PRINT_STATUS,
} from '../../enum'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'

import orderStore from './order_store'
import { OrderFilter } from './interface'
import DriverFilter from '../../components/driver_filter'

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

const SortingOrderFilter: FC<FilterProps> = ({ onSearch }) => {
  // 搜索框文本
  const _handleChangeSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    orderStore.setFilter('search', e.target.value)
  }

  const handleFilterChange = (name: keyof OrderFilter, value: any) => {
    orderStore.setFilter(name, value)
  }

  // 搜索
  const handleSearch = () => {
    onSearch()
  }

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

  // 展开
  const { orderFilter } = orderStore
  const {
    begin_time,
    end_time,
    time_type,

    search,

    driver_selected,
    status,
    route_selected,

    sort_status,
    print_status,
  } = orderFilter

  return (
    <BoxForm
      labelWidth='90px'
      btnPosition='left'
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
            onChange={(e) => {
              orderStore.setFilter('search', e.target.value)
            }}
            className='form-control'
            placeholder={t('输入订单号、商户名、商户ID')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('线路筛选')}>
            <MoreSelect_Route
              multiple
              selected={route_selected}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleFilterChange('route_selected', value)
              }
              getName={(item) => item.route_name!}
            />
          </FormItem>
          <FormItem label={t('订单状态')}>
            <Select
              data={SORTING_STATUS_LIST}
              onChange={(status) => handleFilterChange('status', status)}
              value={status}
            />
          </FormItem>
          <FormItem label={t('分拣状态')}>
            <Select
              data={SORT_STATUS_ORDER}
              onChange={(value) => {
                handleFilterChange('sort_status', value)
              }}
              value={sort_status}
            />
          </FormItem>
          <FormItem label={t('司机筛选')}>
            <Observer>
              {() => (
                <DriverFilter
                  value={driver_selected}
                  onChange={(v) => handleFilterChange('driver_selected', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('打印状态')}>
            <Select
              data={ORDER_PRINT_STATUS}
              value={print_status}
              onChange={(value) => handleFilterChange('print_status', value)}
              style={{ minWidth: '120px' }}
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
          <Button onClick={() => orderStore.reset()}>{t('重置')}</Button>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default observer(SortingOrderFilter)
