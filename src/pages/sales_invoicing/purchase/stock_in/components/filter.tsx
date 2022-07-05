import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  BoxFormMore,
  MoreSelect,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import FilterButton from '@/common/components/filter_button'
import { PAY_STATUS, STOCK_PRINT_STATUS } from '@/pages/sales_invoicing/enum'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { TimeType } from 'gm_api/src/inventory'
import _ from 'lodash'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_SUBMIT,
    name: '按入库时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_ORDER_RECEIVE,
    name: '按预计到货时间',
    expand: false,
  },
]

interface FilterProps {
  onSearch: () => any
  loading: boolean
}

const Filter: FC<FilterProps> = observer((props) => {
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      q,
      is_printed,
      supplier_ids,
      pay_status,
      creator_ids,
      purchaser_ids,
      warehouse_id,
    },
    purchasers,
    supplierList,
  } = store
  const { onSearch, loading } = props

  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.changeFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.changeFilter('begin_time', value.begin)
      store.changeFilter('end_time', value.end)
    }
  }
  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm labelWidth='100px' colWidth='385px' inline onSubmit={onSearch}>
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{ begin: begin_time, end: end_time, dateType: time_type }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              onChange={(value) => {
                store.changeFilter('warehouse_id', value)
              }}
              value={warehouse_id}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              store.changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入采购入库单号或采购单据号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('供应商筛选')}>
            <MoreSelect
              placeholder={t('请选择供应商')}
              data={supplierList.slice()}
              selected={supplier_ids}
              onSelect={(selected) => {
                store.changeFilter('supplier_ids', selected)
              }}
              renderListFilterType='pinyin'
              className='gm-margin-right-10'
            />
          </FormItem>
          {!globalStore.isLite && (
            <FormItem label={t('打印状态')}>
              <Select
                value={is_printed}
                data={STOCK_PRINT_STATUS}
                onChange={(value) => {
                  store.changeFilter('is_printed', value)
                }}
              />
            </FormItem>
          )}
          {!globalStore.isLite && (
            <FormItem label={t('支付状态')}>
              <Select
                value={pay_status?.[0]}
                data={PAY_STATUS}
                onChange={(value) => {
                  store.changeFilter('pay_status', [value])
                }}
              />
            </FormItem>
          )}
          <FormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected) =>
                store.changeFilter('creator_ids', selected)
              }
              getName={(item) => item.name!}
            />
          </FormItem>
          {!globalStore.isLite && (
            <FormItem label={t('采购员')}>
              <MoreSelect
                placeholder={t('请选择采购员')}
                data={purchasers.slice()}
                selected={purchaser_ids}
                onSelect={(selected) => {
                  store.changeFilter('purchaser_ids', selected)
                }}
                renderListFilterType='pinyin'
                className='gm-margin-right-10'
              />
            </FormItem>
          )}
        </FormBlock>
      </BoxFormMore>
      <FilterButton
        loading={loading}
        onExport={
          globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_EXPORT_PURCHASE_IN_SHEET,
          )
            ? handleExport
            : undefined
        }
      />
    </BoxForm>
  )
})

export default Filter
