import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  ControlledFormItem,
  FormButton,
  Button,
  BoxFormMore,
  Select,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import store from '../store'
import DateRangeFilter from '@/common/components/date_range_filter'
// import CategoryFilter from '@/common/components/category_filter_hoc'
import CategoryFilter from '@/pages/order/order_manage/list/view_sku/components/categoryFilter'
import StateFilter from '../../components/state_filter'
import PayStateFilter from '../../components/pay_state_filter'
import OutStockFilter from '../../components/out_stock_filter'
import SearchFilter from '../../components/search_filter'
import AppFilter from '../../components/app_filter'
import ProcessedFilter from '../../components/processed_filter'
import IsProcessedFilter from '../../components/is_or_not_filter'
import CustomerFilter from '../../components/customer_filter'
import SaleMenuFilter from '@/common/components/sale_menu_filter'
import DriverFilter from '../../components/driver_filter'
import SortRemarkFilter from '../../components/sort_remark_filter'
import SortStateFilter from '../../components/sort_state_filter'
import WeightFilter from '../../components/weight_filter'
import MealTImeFilter from '../../components/meal_time_filter'
import InspectionFilter from '../../components/inspection_filter'
import { dateFilterData } from '../../../../util'
import type { F as FilterOptions } from '../interface'
import globalStore from '@/stores/global'
import { ListOrderDetailRequest } from 'gm_api/src/order'
import { Filters_Bool } from 'gm_api/src/common'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import OrderTypeFilter from '@/pages/order/order_manage/list/components/order_type_filter'

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
          <ControlledFormItem label={t('订单状态')} hide={globalStore.isLite}>
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
          <ControlledFormItem label={t('缺货状态')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <OutStockFilter
                  value={store.filter.is_out_stock}
                  onChange={(v) => handleFilterChange('is_out_stock', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem
            label={t('报价单/菜谱')}
            hide={globalStore.isLite}
          >
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
          <ControlledFormItem label={t('司机筛选')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <DriverFilter
                  value={store.filter.drivers}
                  onChange={(v) => handleFilterChange('drivers', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('计重类型')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <WeightFilter
                  value={store.filter.is_weight}
                  onChange={(v) => handleFilterChange('is_weight', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('分拣状态')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <SortStateFilter
                  value={store.filter.sort_status}
                  onChange={(v) => handleFilterChange('sort_status', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('分拣备注')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <SortRemarkFilter
                  value={store.filter.sort_remark}
                  onChange={(v) => handleFilterChange('sort_remark', v)}
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
          <ControlledFormItem label={t('订单来源')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <AppFilter
                  value={store.filter.app_id}
                  onChange={(v) => handleFilterChange('app_id', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          {/* <ControlledFormItem label={t('是否加工品')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <IsProcessedFilter
                  value={store.filter.sku_is_process}
                  onChange={(v) => handleFilterChange('sku_is_process', v)}
                />
              )}
            </Observer>
          </ControlledFormItem> */}
          <ControlledFormItem
            label={t('是否发布生产计划')}
            hide={globalStore.isLite}
          >
            <Observer>
              {() => (
                <ProcessedFilter
                  value={store.filter.is_create_production_task}
                  onChange={(v) =>
                    handleFilterChange('is_create_production_task', v)
                  }
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem
            label={t('是否发布采购计划')}
            hide={globalStore.isLite}
          >
            <Observer>
              {() => (
                <ProcessedFilter
                  value={store.filter.is_create_purchase_task}
                  onChange={(v) =>
                    handleFilterChange('is_create_purchase_task', v)
                  }
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('餐次')} hide={globalStore.isLite}>
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
          <ControlledFormItem label={t('验收状态')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <InspectionFilter
                  value={store.filter.accept_state}
                  onChange={(v) => handleFilterChange('accept_state', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem
            label={t('供应商协作模式')}
            hide={globalStore.isLite}
          >
            <Observer>
              {() => (
                <Select
                  data={[
                    {
                      value: -1,
                      text: t('全部状态'),
                    },
                    {
                      value:
                        Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
                      text: t('仅供货'),
                    },
                    {
                      value: Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
                      text: t('代分拣'),
                    },
                    {
                      value: Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
                      text: t('代配送'),
                    },
                  ]}
                  value={store.filter.supplier_cooperate_model_type}
                  onChange={(v) =>
                    handleFilterChange('supplier_cooperate_model_type', v)
                  }
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem
            label={t('是否库存状态')}
            hide={globalStore.isLite}
          >
            <Observer>
              {() => (
                <Select
                  data={[
                    {
                      value: 0,
                      text: t('全部状态'),
                    },
                    {
                      value: 1,
                      text: t('是'),
                    },
                    {
                      value: 2,
                      text: t('否'),
                    },
                  ]}
                  value={store.filter.manual_purchase}
                  onChange={(v) => handleFilterChange('manual_purchase', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('价格类型')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <Select
                  data={[
                    {
                      value: Filters_Bool.ALL,
                      text: t('全部'),
                    },
                    {
                      value: Filters_Bool.TRUE,
                      text: t('时价'),
                    },
                    {
                      value: Filters_Bool.FALSE,
                      text: t('非时价'),
                    },
                  ]}
                  value={store.filter.sku_unit_is_current_price}
                  onChange={(v) =>
                    handleFilterChange('sku_unit_is_current_price', v)
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
