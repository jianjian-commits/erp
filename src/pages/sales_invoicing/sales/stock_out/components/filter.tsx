import * as React from 'react'
import { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Select,
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  BoxFormMore,
  MoreSelect,
} from '@gm-pc/react'
import { Permission } from 'gm_api/src/enterprise'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'

import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import FilterButton from '@/common/components/filter_button'

import { STOCK_PRINT_STATUS } from '@/pages/sales_invoicing/enum'

import globalStore from '@/stores/global'
import { ListSotre } from '../stores/index'

const dateFilterData = [
  {
    type: 1,
    name: '按建单时间',
    expand: false,
  },
  {
    type: 2,
    name: '按出库时间',
    expand: false,
  },
  {
    type: 11,
    name: '按收货时间',
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
      customer_label_selected,
      creator_ids,
      warehouse_id,
    },
    customerLabelList,
    changeFilter,
    exportSaleOutStockSheet,
  } = ListSotre
  const { onSearch, loading } = props
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      changeFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      changeFilter('begin_time', value.begin)
      changeFilter('end_time', value.end)
    }
  }

  const handleExport = () => {
    exportSaleOutStockSheet().then((json) => {
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
              value={warehouse_id}
              onChange={(selected) => {
                changeFilter('warehouse_id', selected)
              }}
              placeholder={t('请选择仓库')}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入销售出库单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          {!globalStore.isLite && (
            <>
              <FormItem label={t('打印状态')}>
                <Select
                  value={is_printed}
                  data={STOCK_PRINT_STATUS}
                  onChange={(value) => {
                    changeFilter('is_printed', value)
                  }}
                />
              </FormItem>
              <FormItem label={t('客户标签')}>
                <MoreSelect
                  renderListFilterType='pinyin'
                  multiple
                  data={customerLabelList.slice()}
                  selected={customer_label_selected}
                  onSelect={(selected) => {
                    changeFilter('customer_label_selected', selected)
                  }}
                />
              </FormItem>
            </>
          )}
          <FormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected) => changeFilter('creator_ids', selected)}
              getName={(item) => item.name!}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>

      <FilterButton
        loading={loading}
        onExport={
          globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_EXPORT_SALE_OUT_SHEET,
          )
            ? handleExport
            : undefined
        }
      />
    </BoxForm>
  )
})

export default Filter
