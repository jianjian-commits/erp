import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  DateRangePicker,
  FormItem,
  FormButton,
  Button,
  Input,
  BoxFormMore,
  Flex,
  MoreSelect,
  Select,
} from '@gm-pc/react'
import { Select_Customer, MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import type { MoreSelectDataItem } from '@gm-pc/react'

import { CategoryFilter } from '@/common/components'
import { OPERATE_TYPE } from '@/pages/sales_invoicing/enum'
import { ComRouter } from '@/pages/sales_invoicing/interface'
import { diffPlaceholderText } from '@/pages/sales_invoicing/inventory_account/util'
import type { FilterType } from '../types'
import {
  GroupUser,
  ListGroupUser,
  ListSupplier,
  Permission,
  Supplier,
} from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface ChangeFilter {
  orderType: number
  filter: FilterType
  onChange: <T extends keyof FilterType>(key: T, value: FilterType[T]) => any
  onSearch: () => any
  onExport: () => any
  routeList?: ComRouter[]
}

const Filter: FC<ChangeFilter> = observer((props) => {
  const { orderType, filter, routeList, onChange, onSearch, onExport } = props
  const {
    begin_time,
    end_time,
    q,
    target_id,
    target_customer_ids,
    target_route_ids,
    purchaser_id,
    supplier_id,
    warehouse_id,
  } = filter
  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    onChange(key, value)
  }

  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      handleFilterChange('begin_time', begin_time)
      handleFilterChange('end_time', end_time)
    }
  }

  const handleExport = () => {
    onExport().then((json: any) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  const [supplierList, setSuppliers] = useState<Supplier[]>([])
  const [purchaserList, setpurchasers] = useState<GroupUser[]>([])
  useEffect(() => {
    const arr = [
      { value: '', text: '全部' },
      { value: '0', text: '无' },
    ] as any
    ListSupplier({ paging: { limit: 999 } }).then((json) => {
      const supplier_list = json.response.suppliers!.map((v) => ({
        ...v,
        value: v.supplier_id!,
        text: v.name!,
      }))
      supplier_list.unshift(...arr)
      setSuppliers(supplier_list)
      return null
    })
    ListGroupUser({ paging: { limit: 999 }, role_types: [3] }).then((json) => {
      const purchaser_list = json.response.group_users!.map((v) => ({
        ...v,
        value: v.group_user_id!,
        text: v.name!,
      }))
      purchaser_list.unshift(...arr)
      setpurchasers(purchaser_list)
      return null
    })
  }, [])

  return (
    <BoxForm labelWidth='90px' onSubmit={onSearch} colWidth='420px'>
      <FormBlock col={3}>
        <FormItem label={t('入库时间')}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value) => {
                handleFilterChange('warehouse_id', value)
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')} colWidth='420px'>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={diffPlaceholderText(orderType)}
            // placeholder={t(
            //   '请输入商品名称、商品编码、领料单号或退料入库单号搜索',
            // )}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('商品筛选')}>
            <CategoryFilter
              style={{ width: '100%' }}
              onChange={(category_id) =>
                handleFilterChange('category_id', category_id)
              }
            />
          </FormItem>
          {orderType === OPERATE_TYPE.purchaseIn && (
            <FormItem label={t('供应商')}>
              <Select
                data={supplierList}
                value={supplier_id}
                onChange={(value) => {
                  handleFilterChange('supplier_id', value)
                }}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.purchaseIn && (
            <FormItem label={t('采购员')}>
              <Select
                data={purchaserList}
                value={purchaser_id}
                onChange={(value) => {
                  handleFilterChange('purchaser_id', value)
                }}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.refundIn && (
            <FormItem label={t('客户')}>
              <Select_Customer
                params={{ level: 2 }}
                all={{ value: '0' }}
                value={target_id!}
                onChange={(value: string) => {
                  handleFilterChange('target_id', value)
                }}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.productIn && (
            <FormItem label={t('客户筛选')}>
              <MoreSelect_Customer
                multiple
                params={{ level: 1 }}
                selected={target_customer_ids}
                onSelect={(select: MoreSelectDataItem<string>[]) => {
                  handleFilterChange('target_customer_ids', select)
                }}
                placeholder={t('全部')}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.productIn && (
            <FormItem label={t('线路筛选')}>
              <MoreSelect
                multiple
                data={routeList!.slice()}
                selected={target_route_ids}
                onSelect={(select: MoreSelectDataItem<string>[]) => {
                  handleFilterChange('target_route_ids', select)
                }}
                placeholder={t('全部线路')}
              />
            </FormItem>
          )}
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Flex>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_EXPORT_IN_STOCK_LOG}
          >
            <Button onClick={handleExport}>{t('导出')}</Button>
          </PermissionJudge>
        </Flex>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
