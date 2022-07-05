import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'
import moment from 'moment'
import DateRangeFilter from '@/common/components/date_range_filter'
import StateFilter from './filter_components/state_filter'
import PayStateFilter from './filter_components/pay_state_filter'
import SearchFilter from './filter_components/search_filter'
import AppFilter from './filter_components/app_filter'
import CustomerFilter from './filter_components/customer_filter'
import SaleMenuFilter from '@/common/components/sale_menu_filter'
import RemarkFilter from './filter_components/remark_filter'
import DriverFilter from './filter_components/driver_filter'
import SortRemarkFilter from './filter_components/sort_remark_filter'
import IsStockFilter from './filter_components/is_or_not_filter'
import type { FilterOptions } from '../interface'
import { Filters_Bool } from 'gm_api/src/common'

export const dateFilterData = [
  {
    type: 1,
    diyText: t('下单日期'),
    name: t('按下单日期'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().endOf('day')
    },
  },
  {
    type: 2,
    diyText: t('收货日期'),
    name: t('按收货日期'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().add(30, 'day').endOf('day')
    },
  },
  {
    type: 3,
    diyText: t('出库时间'),
    name: t('按出库时间'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().endOf('day')
    },
  },
]

interface FilterProps {
  onSearch: (params?: any) => Promise<any>
}
const Filter: FC<FilterProps> = (props) => {
  const handleSearch = () => {
    props.onSearch()
  }
  function handleFilterChange<T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ) {
    store.updateFilter(key, value)
  }

  function handleDateChange(value: {
    begin?: Date
    end?: Date
    dateType?: number
  }) {
    if (value.dateType) {
      handleFilterChange('dateType', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin', value.begin)
      handleFilterChange('end', value.end)
    }
  }

  function handleReset() {
    store.initFilter()
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
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
        <FormItem>
          <Observer>
            {() => (
              <SearchFilter
                value={{
                  serial_no: store.filter.serial_no,
                  receive_customer_id: store.filter.receive_customer_id,
                }}
                onChange={handleFilterChange}
              />
            )}
          </Observer>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('订单状态')}>
            <Observer>
              {() => (
                <StateFilter
                  value={store.filter.status}
                  onChange={(v) => handleFilterChange('status', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('支付状态')}>
            <Observer>
              {() => (
                <PayStateFilter
                  value={store.filter.pay_status}
                  onChange={(v) => handleFilterChange('pay_status', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('报价单')}>
            <Observer>
              {() => (
                <SaleMenuFilter
                  value={store.filter.sale_menus}
                  onChange={(v) => handleFilterChange('sale_menus', v)}
                />
              )}
            </Observer>
          </FormItem>
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
          <FormItem label={t('订单来源')}>
            <Observer>
              {() => (
                <AppFilter
                  value={store.filter.app_id}
                  onChange={(v) => handleFilterChange('app_id', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('司机筛选')}>
            <Observer>
              {() => (
                <DriverFilter
                  value={store.filter.drivers}
                  onChange={(v) => handleFilterChange('drivers', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('分拣备注')}>
            <Observer>
              {() => (
                <SortRemarkFilter
                  value={store.filter.sort_remark}
                  onChange={(v) => handleFilterChange('sort_remark', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('订单备注')}>
            <Observer>
              {() => (
                <RemarkFilter
                  value={store.filter.has_remark}
                  onChange={(v) => handleFilterChange('has_remark', v)}
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('是否生成销售出库单')}>
            <Observer>
              {() => (
                <IsStockFilter
                  value={store.filter.is_create_stock_sheet}
                  onChange={(v) =>
                    handleFilterChange('is_create_stock_sheet', v)
                  }
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('回单状态')}>
            <Observer>
              {() => {
                const { filter } = store
                const { is_scan_receipt } = filter
                return (
                  <Select
                    all
                    data={[
                      { value: Filters_Bool.FALSE, text: t('未回单') },
                      { value: Filters_Bool.TRUE, text: t('已回单') },
                    ]}
                    value={is_scan_receipt}
                    onChange={(value: number) => {
                      handleFilterChange('is_scan_receipt', value)
                    }}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
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
