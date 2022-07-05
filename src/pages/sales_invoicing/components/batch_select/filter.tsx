import {
  Box,
  Form,
  FormItem,
  FormBlock,
  DateRangePicker,
  FormButton,
  Button,
  Input,
  Select,
  MoreSelect,
  MoreSelectDataItem,
  LevelSelect,
  LevelSelectDataItem,
} from '@gm-pc/react'
import React, { FC, memo, useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { t } from 'gm-i18n'
import _ from 'lodash'
import ClassNames from 'classnames'
import { OperateType, Shelf } from 'gm_api/src/inventory'
import { getTimestamp, formatDataToTree } from '@/common/util'
import { ListSsu, Sku_SkuType } from 'gm_api/src/merchandise'
import { ComSsuItem } from '../../interface'

import { getTargetSsuList } from '../../util'
import UnitItemTip from '../sign_tip'
import { Filters_Bool, PagingParams } from 'gm_api/src/common'
import { BatchSelectContext } from './batch_select'
import { ListCustomer } from 'gm_api/src/enterprise'
import { ListRoute } from 'gm_api/src/delivery'
import globalStore from '@/stores/global'

const fetchSsuList = (sku_id: string) => {
  return ListSsu({ sku_ids: [sku_id], paging: { limit: 999 } }).then((json) => {
    return json
  })
}

const renderSelectItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.isVirtualBase && <UnitItemTip text={t('基本单位')} />}
    </div>
  )
}

const renderSelected = (item: any) => {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span>{item.text}</span>
      {item.isVirtualBase && <UnitItemTip text={t('基本单位')} />}
    </span>
  )
}

interface BatchFilterType {
  paging: PagingParams
  supplier_id?: string
  q?: string
  begin_time?: string
  end_time?: string
  sku_id?: string
  base_unit_id?: string
  sku_unit_id?: string
  with_additional?: boolean
  remaining?: Filters_Bool
  production_task_id?: string
  shelf_ids?: string[]
  target_customer_ids: string[]
  target_route_ids?: string[]
  batch_level?: number
  warehouse_id?: string
  material_order_id?: string
}

interface BatchLogFilterType {
  paging: PagingParams
  q?: string
  begin_time?: string
  end_time?: string
  with_additional?: boolean
  sku_id?: string
  sku_ids?: string[]
  production_task_ids?: string[]
  operates?: OperateType[]
  material_order_id?: string
}

interface FilterType {
  begin_time?: Date | null
  end_time?: Date | null
  q: string
  sku_id: string
  sku_base_unit_id: string
  ssu_unit_id?: string
  supplier_id?: string
  remaining: Filters_Bool
  production_task_id?: string
  with_additional?: boolean
  operates?: OperateType[]
  customer_selected?: MoreSelectDataItem<string>[]
  route_selected?: MoreSelectDataItem<string>[]
  shelf_ids?: string[]
  material_order_id?: string
}

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  sku_id: '',
  sku_base_unit_id: '',
  ssu_unit_id: '',
  supplier_id: undefined,
  remaining: Filters_Bool.TRUE, // 拉取库存大于0的
  with_additional: true,
  operates: undefined,
  customer_selected: [],
  route_selected: [],
  shelf_ids: [],
  material_order_id: '',
}

interface FilterProps {
  onSearch: (filter: BatchFilterType | BatchLogFilterType) => void
  defaultFilter?: Partial<FilterType>
  shelf?: Shelf[]
  defaultProduct: {
    sku_id: string
    sku_base_unit_id: string
    ssu_unit_id: string
    sku_type: Sku_SkuType
  }
  loading: boolean
  maxTime?: Date
  warehouseId?: string
  type?: 'inventory' | 'refund_stock_in'
}

const Filter: FC<FilterProps> = (props) => {
  const { onSearch, loading, defaultFilter, defaultProduct, maxTime, shelf } =
    props
  const { type, hasCustomer, hasTarget } = useContext(BatchSelectContext)
  const isRefundStockIn = type === 'refund_stock_in'
  const [filter, setFilter] = useState<FilterType>({
    ...initFilter,
    ...defaultFilter,
    sku_id: defaultProduct.sku_id,
    sku_base_unit_id: defaultProduct.sku_base_unit_id,
    ssu_unit_id: defaultProduct.ssu_unit_id,
  })

  const [customerData, setCustomerData] = useState<
    MoreSelectDataItem<string>[]
  >([])
  const [routeData, setRoute] = useState<MoreSelectDataItem<string>[]>([])
  const shelfList: LevelSelectDataItem<string>[] = formatDataToTree(
    shelf!,
    'shelf_id',
    'name',
  )
  shelfList.unshift({
    text: t('未分配'),
    value: '0',
    shelf_id: '0',
    parent_id: '0',
  })

  const handleSearch = () => {
    const {
      begin_time,
      end_time,
      q,
      sku_id,
      sku_base_unit_id,
      ssu_unit_id,
      supplier_id,
      remaining,
      production_task_id,
      with_additional,
      operates,
      shelf_ids,
      material_order_id,
    } = filter

    const nowFilter: BatchFilterType | BatchLogFilterType = {
      begin_time: getTimestamp(begin_time!),
      end_time: getTimestamp(end_time!),
      q,
      paging: { limit: 999 },
      with_additional,
    }

    if (isRefundStockIn) {
      // 退料入库
      Object.assign(nowFilter, {
        /** 接口改变为了ListMaterialInBatches */
        sku_id: sku_id,
        /** 退料入库不再支持根据"生产计划编号"获取关联批次 */
        // production_task_ids: production_task_id
        //   ? [production_task_id]
        //   : undefined,
        /** 退料入库新增根据单据关联的"领料单" 获取关联批次 */
        material_order_id,
        operates,
      })
    } else {
      Object.assign(nowFilter, {
        sku_id,
        base_unit_id: sku_base_unit_id,
        sku_unit_id: ssu_unit_id || null,
        supplier_id: supplier_id,
        remaining,
        production_task_id,
        batch_level: 2,
      })
      if (hasCustomer) {
        ;(nowFilter as BatchFilterType).target_customer_ids = _.map(
          filter.customer_selected!,
          (item) => item.value,
        )
        ;(nowFilter as BatchFilterType).target_route_ids = _.map(
          filter.route_selected!,
          (item) => item.value,
        )
      }
      if (hasTarget) {
        ;(nowFilter as BatchFilterType).shelf_ids = _.filter(
          shelf_ids,
          (_, index) => index === shelf_ids!.length - 1,
        )
      }
    }
    onSearch({
      ...nowFilter,
    })
  }

  const handleDateChange = (begin_time: Date | null, end_time: Date | null) => {
    setFilter({
      ...filter,
      begin_time,
      end_time,
    })
  }

  useEffect(() => {
    handleSearch()
  }, [])

  useEffect(() => {
    if (hasCustomer) {
      ListCustomer({ paging: { limit: 999 } }).then((json) => {
        const { customers } = json.response
        if (customers) {
          const data = _.map(customers, (customer) => ({
            ...customer,
            value: customer.customer_id,
            text: customer.name,
          }))
          const filterData = _.filter(
            [
              {
                text: t('无'),
                value: '0',
                parent_id: '0',
              },
              ...data,
            ],
            (c) => c.parent_id === '0',
          )
          setCustomerData(filterData)
        }
        return json
      })

      ListRoute({ paging: { limit: 999 } }).then((json) => {
        const { routes } = json.response
        if (routes) {
          const data = _.map(routes, (routes) => ({
            ...routes,
            value: routes.route_id,
            text: routes.route_name,
          }))
          data.unshift({
            text: t('无'),
            value: '0',
            route_id: '',
            route_name: '',
          })
          setRoute(data)
        }
        return json
      })
    }
  }, [])
  return (
    <Box hasGap>
      <Form
        labelWidth={hasCustomer ? '90px' : '70px'}
        colWidth={hasCustomer ? '190px' : '180px'}
        onSubmit={handleSearch}
        inline
        btnPosition='left'
      >
        <FormBlock col={3}>
          <FormItem
            label={t(`${isRefundStockIn ? '领料' : '入库'}时间`)}
            col={2}
          >
            <DateRangePicker
              begin={filter.begin_time}
              end={filter.end_time}
              enabledTimeSelect
              onChange={handleDateChange}
              max={maxTime}
              endTimeSelect={
                maxTime
                  ? {
                      disabledSpan: (time) => {
                        return moment(time).isAfter(moment(maxTime))
                      },
                    }
                  : undefined
              }
            />
          </FormItem>
          {!globalStore.isLite && hasTarget && (
            <FormItem label={t('货位')} colWidth='210px'>
              <LevelSelect
                selected={filter.shelf_ids!}
                data={shelfList}
                onSelect={(e) => {
                  setFilter({ ...filter, shelf_ids: e })
                }}
                placeholder={t('全部')}
              />
            </FormItem>
          )}

          <FormItem label={t('搜索')} col={2}>
            <Input
              value={filter.q}
              onChange={(e) => {
                setFilter({ ...filter, q: e.target.value })
              }}
              placeholder={t('请输入批次号')}
            />
          </FormItem>
        </FormBlock>
        {!globalStore.isLite && hasCustomer && (
          <FormBlock col={3} className='gm-margin-top-10'>
            <FormItem label={t('客户筛选')} colWidth='320px'>
              <MoreSelect
                data={customerData}
                multiple
                selected={filter.customer_selected}
                onSelect={(selected: MoreSelectDataItem<string>[]) =>
                  setFilter({ ...filter, customer_selected: selected })
                }
                placeholder={t('全部')}
              />
            </FormItem>
            <FormItem label={t('线路筛选')} colWidth='320px'>
              <MoreSelect
                data={routeData}
                multiple
                selected={filter.route_selected}
                onSelect={(selected: MoreSelectDataItem<string>[]) =>
                  setFilter({ ...filter, route_selected: selected })
                }
                placeholder={t('全部线路')}
              />
            </FormItem>
          </FormBlock>
        )}
        <FormButton>
          <Button
            type='primary'
            htmlType='submit'
            disabled={loading}
            className={ClassNames({ 'gm-margin-top-10': hasCustomer })}
          >
            {t('搜索')}
          </Button>
        </FormButton>
      </Form>
    </Box>
  )
}

export default memo(Filter)
export type { FilterType, BatchFilterType, BatchLogFilterType }
