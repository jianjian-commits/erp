import React, { FC, useRef, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  ControlledFormItem,
  FormButton,
  Button,
  Popover,
  List,
  Select,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import store from '../store'

import DateRangeFilter from '@/common/components/date_range_filter'
import StateFilter from '../../components/state_filter'
import PayStateFilter from '../../components/pay_state_filter'
import SearchFilter from '../../components/search_filter'
import AppFilter from '../../components/app_filter'
import CustomerFilter from '../../components/customer_filter'
import SaleMenuFilter from '@/common/components/sale_menu_filter'
import RemarkFilter from '../../components/remark_filter'
import DriverFilter from '../../components/driver_filter'
import SortRemarkFilter from '../../components/sort_remark_filter'
import IsStockFilter from '../../components/is_or_not_filter'
import MealTImeFilter from '../../components/meal_time_filter'
// import InspectionFilter from '../../components/inspection_filter'
import { dateFilterData } from '../../../../util'
import SVGDownTriangle from '@/svg/down_triangle.svg'
import {
  ExportOrder,
  ExportProductionPurchaseTask,
  ExportSortingByCompanySummary,
  ExportSortingBySkuSummary,
} from 'gm_api/src/orderlogic'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'

import type { F as FilterOptions } from '../interface'
import {
  ListOrderRequest,
  ListOrderRequest_PagingField,
  ListOrderResponse,
} from 'gm_api/src/order'
import { Filters_Bool } from 'gm_api/src/common'

import moment from 'moment'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import OrderTypeFilter from '@/pages/order/order_manage/list/components/order_type_filter'

interface FilterProps {
  onSearch: (params?: ListOrderRequest) => Promise<ListOrderResponse>
}
const Filter: FC<FilterProps> = (props) => {
  const popoverRef = useRef<Popover>(null)

  const handleSearch = () => {
    props.onSearch()
  }

  function handleReset(): void {
    store.initFilter()
  }

  useEffect(() => handleReset, [])

  function handleFilterChange<T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ): void {
    store.updateFilter(key, value)
  }

  function handleDateChange(value: {
    begin?: Date
    end?: Date
    dateType?: number
  }): void {
    if (value.dateType) {
      handleFilterChange('dateType', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin', value.begin)
      handleFilterChange('end', value.end)
    }
  }

  function handleExport(): void {
    ExportOrder({
      filter: {
        common_list_order: store.getParams(),
        sort_by: [
          {
            field: ListOrderRequest_PagingField.ORDER_TIME,
            desc: true,
          },
        ],
        paging: { limit: 999 },
      },
      need_fake_info:
        globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ) && !globalStore.isLite,
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleMaterialExport = (): void => {
    ExportProductionPurchaseTask({
      order_filter: {
        common_list_order: store.getParams(),
        paging: { limit: 999 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleSortExport = () => {
    ExportSortingByCompanySummary({
      filter: {
        common_list_order: store.getParams(),
        paging: { limit: 999 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleSortingBySkuSummaryExport = () => {
    ExportSortingBySkuSummary({
      filter: {
        common_list_order: store.getParams(),
        paging: { limit: 999 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleSumExport = (selected: number): void => {
    popoverRef.current!.apiDoSetActive(false)
    switch (selected) {
      case 0: {
        handleExport()
        break
      }
      case 1: {
        handleMaterialExport()
        break
      }
      case 2: {
        handleSortExport()
        break
      }
      case 3: {
        handleSortingBySkuSummaryExport()
        break
      }
      default:
        break
    }
  }

  return (
    <BoxForm<FilterOptions>
      labelWidth='100px'
      colWidth='385px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        {
          <Observer>
            {() => {
              const { begin, end, dateType } = store.filter
              return (
                <DateRangeFilter
                  data={[
                    ...dateFilterData,
                    {
                      type: 3,
                      diyText: t('出库日期'), // 也是限制一个月
                      name: t('按出库日期'),
                      expand: false,
                      limit: (date: Date) => {
                        return (
                          moment(date) > moment().add(30, 'day').endOf('day')
                        )
                      },
                    },
                  ]}
                  value={{ begin, end, dateType }}
                  onChange={handleDateChange}
                  enabledTimeSelect
                />
              )
            }}
          </Observer>
        }
        <ControlledFormItem>
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
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
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
          <ControlledFormItem label={t('订单备注')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <RemarkFilter
                  value={store.filter.has_remark}
                  onChange={(v) => handleFilterChange('has_remark', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem
            label={t('是否生成销售出库单')}
            hide={globalStore.isLite}
          >
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
          </ControlledFormItem>
          <ControlledFormItem label={t('回单状态')} hide={globalStore.isLite}>
            <Select
              all
              data={[
                { value: Filters_Bool.FALSE, text: t('未回单') },
                { value: Filters_Bool.TRUE, text: t('已回单') },
              ]}
              value={store.filter.is_scan_receipt}
              onChange={(v) => handleFilterChange('is_scan_receipt', v)}
            />
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
        {!globalStore.isLite ? (
          <Popover
            ref={popoverRef}
            type='click'
            popup={
              <List
                data={[
                  { value: 0, text: t('导出订单') },
                  { value: 1, text: t('导出物料需求') },
                  { value: 2, text: t('导出公司汇总分拣单') },
                  { value: 3, text: t('导出商品汇总分拣单') },
                ]}
                onSelect={handleSumExport}
                className='gm-border-0'
                style={{ minWidth: '30px' }}
              />
            }
          >
            <Button className='gm-margin-left-10'>
              <>
                <span className='gm-margin-right-10'>{t('导出')}</span>
                <SVGDownTriangle />
              </>
            </Button>
          </Popover>
        ) : (
          <Button onClick={handleExport} className='gm-margin-left-10'>
            {t('导出')}
          </Button>
        )}
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
