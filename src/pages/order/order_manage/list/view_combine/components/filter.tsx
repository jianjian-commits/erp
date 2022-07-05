import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  ControlledFormItem,
  FormButton,
  Button,
  BoxFormMore,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import store from '../store'
import DateRangeFilter from '@/common/components/date_range_filter'
import StateFilter from '../../components/state_filter'
import PayStateFilter from '../../components/pay_state_filter'
import SearchFilter from '../../components/search_filter'
import AppFilter from '../../components/app_filter'
import MealTImeFilter from '../../components/meal_time_filter'
import CustomerFilter from '../../components/customer_filter'
import SaleMenuFilter from '@/common/components/sale_menu_filter'
import DriverFilter from '../../components/driver_filter'
import { dateFilterData } from '../../../../util'
import type { FilterOptions } from '../store'
import CategoryFilter from '@/pages/order/order_manage/list/view_sku/components/categoryFilter'
import { ListOrderDetailRequest } from 'gm_api/src/order'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
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
        <FormBlock col={3}>
          <ControlledFormItem label={t('商品分类')}>
            <Observer>
              {() => (
                <CategoryFilter
                  selected={store.filter.category}
                  cascaderOptions={store.categoryData}
                  onChange={(v) => handleFilterChange('category', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('订单状态')}>
            <Observer>
              {() => (
                <StateFilter
                  value={store.filter.status}
                  onChange={(v) => handleFilterChange('status', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('支付状态')}>
            <Observer>
              {() => (
                <PayStateFilter
                  value={store.filter.pay_status}
                  onChange={(v) => handleFilterChange('pay_status', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('报价单/菜谱')}>
            <Observer>
              {() => (
                <SaleMenuFilter
                  value={store.filter.sale_menus}
                  onChange={(v) => handleFilterChange('sale_menus', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('商户筛选')}>
            <Observer>
              {() => (
                <CustomerFilter
                  value={store.filter.customers}
                  onChange={(v) => handleFilterChange('customers', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('线路筛选')} hide={globalStore.isLite}>
            <MoreSelect_Route
              multiple
              selected={store.filter.route}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleFilterChange('route', value)
              }
              getName={(item) => item.route_name!}
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('司机筛选')}>
            <Observer>
              {() => (
                <DriverFilter
                  value={store.filter.drivers}
                  onChange={(v) => handleFilterChange('drivers', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
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
          <ControlledFormItem label={t('订单来源')}>
            <Observer>
              {() => (
                <AppFilter
                  value={store.filter.app_id}
                  onChange={(v) => handleFilterChange('app_id', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('餐次')}>
            <Observer>
              {() => (
                <MealTImeFilter
                  value={store.filter.menu_period_group_ids}
                  onChange={(v) =>
                    handleFilterChange('menu_period_group_ids', v)
                  }
                />
              )}
            </Observer>
          </ControlledFormItem>
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
