import DateRangeFilter from '@/common/components/date_range_filter'
import SearchFilter from '@/pages/order/order_manage/list/components/search_filter'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { dateFilterData } from '@/pages/order/util'
import { BoxForm, BoxFormMore, Button, Flex } from '@gm-pc/react'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import CustomerFilter from '@/pages/order/order_manage/list/components/customer_filter'
import SaleMenuFilter from '@/common/components/sale_menu_filter'
import MealTimeFilter from '@/pages/order/order_manage/list/components/meal_time_filter'
import { FilterOptions } from '@/pages/order/interface'
import moment from 'moment'
import { getOrderParams } from '@/pages/production/plan_management/plan/produce_plan/util'
import { Col, Row } from 'antd'
import _ from 'lodash'

export interface Filter extends Partial<FilterOptions> {
  category?: string[]
  sku_q?: string
}

const initFilter = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  sku_q: '',
  q: '',
  receive_customer_id: '',
  dateType: 1,
  category: [],
  customers: [],
  sale_menus: [],
  menu_period_group_ids: [],
  serial_no: '',
}

/** 延迟 */
const debounceKey = ['serial_no', 'receive_customer_id', 'sku_q']
/** 不需要实时 */
const filterKey = ['view_sku', 'dateType', 'begin', ...debounceKey]

const OrderFilter = forwardRef<any, { fetchList: any }>(
  ({ fetchList }, ref) => {
    const [oderFilter, setOrderFilter] = useState<Filter>({
      ...initFilter,
    })
    const {
      begin,
      end,
      dateType,
      customers,
      sale_menus,
      menu_period_group_ids,
      category,
      serial_no,
      receive_customer_id,
      sku_q,
    } = oderFilter

    useImperativeHandle(ref, () => ({
      onFinish,
    }))

    const onFinish = (isResetCurrent?: boolean, data?: Filter) => {
      fetchList(getOrderParams(data ?? oderFilter), isResetCurrent)
    }

    const timeRef = useRef(
      _.debounce(
        (isResetCurrent?: boolean, data?: Filter) =>
          onFinish(isResetCurrent, data),
        500,
      ),
    )

    const handleUpdateFilter = <T extends keyof Filter>(
      key: T,
      value: Filter[T],
    ) => {
      setOrderFilter((v) => {
        const data = {
          ...v,
          [key]: value,
        }
        /** 延迟和实时搜索 */
        if (!filterKey.includes(key)) {
          onFinish(true, data)
          return data
        }
        debounceKey.includes(key) && timeRef.current(true, data)
        return data
      })
    }

    const handleDateChange = (value: {
      begin?: Date
      end?: Date
      dateType?: number
    }) => {
      if (value.dateType) {
        handleUpdateFilter('dateType', value.dateType)
      }
      if (value.begin && value.end) {
        handleUpdateFilter('begin', value.begin)
        handleUpdateFilter('end', value.end)
      }
    }

    return (
      <BoxForm>
        <Row>
          <Col span={13}>
            <DateRangeFilter
              data={dateFilterData}
              value={{ begin: begin!, end: end!, dateType: dateType! }}
              onChange={handleDateChange}
              enabledTimeSelect
            />
          </Col>
          <Col span={11}>
            <Flex>
              <SearchFilter
                type='view_sku'
                value={{
                  serial_no: serial_no!,
                  receive_customer_id: receive_customer_id!,
                  sku_q,
                }}
                onChange={handleUpdateFilter}
              />
            </Flex>
          </Col>
        </Row>
        <BoxFormMore>
          <Row justify='space-between' align='middle'>
            <Col span={5}>
              <CategoryCascader
                style={{ width: '100%' }}
                value={category}
                onChange={(v) => handleUpdateFilter('category', v as string[])}
                showAdd={false}
              />
            </Col>
            <Col span={5}>
              <CustomerFilter
                value={customers!}
                onChange={(v) => handleUpdateFilter('customers', v)}
              />
            </Col>
            <Col span={5}>
              <MealTimeFilter
                value={menu_period_group_ids!}
                onChange={(v) => handleUpdateFilter('menu_period_group_ids', v)}
              />
            </Col>
            <Col span={5}>
              <SaleMenuFilter
                value={sale_menus!}
                onChange={(v) => handleUpdateFilter('sale_menus', v)}
              />
            </Col>
          </Row>
        </BoxFormMore>
      </BoxForm>
    )
  },
)

export default OrderFilter
