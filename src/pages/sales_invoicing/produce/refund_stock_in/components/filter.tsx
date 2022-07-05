import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  BoxFormMore,
  LevelSelect,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import receiptStore from '../stores/receipt_store'
import FilterButton from '@/common/components/filter_button'
import { STOCK_PRINT_STATUS } from '@/pages/sales_invoicing/enum'
import globalStore from '@/stores/global'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { Permission } from 'gm_api/src/enterprise'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

const dateFilterData = [
  {
    type: 1,
    name: '按建单时间',
    expand: false,
  },
  {
    type: 2,
    name: '按入库时间',
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
      creator_ids,
      processor_ids,
      warehouse_id,
    },
    processors,
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

  useEffect(() => {
    store.getProcessorList()
    receiptStore.fetchProcess()
  }, [])

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
              onChange={(value) => {
                store.changeFilter('warehouse_id', value)
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              store.changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入退料入库单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('打印状态')}>
            <Select
              value={is_printed}
              data={STOCK_PRINT_STATUS}
              onChange={(value) => {
                store.changeFilter('is_printed', value)
              }}
            />
          </FormItem>
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
          <FormItem label={t('领用部门')}>
            <LevelSelect
              selected={processor_ids.slice()}
              placeholder={t('请选择领用部门')} // 需要更新组件库支持placeholder
              data={processors.slice()}
              onSelect={(value) => {
                store.changeFilter('processor_ids', value)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FilterButton
        loading={loading}
        onExport={
          globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_EXPORT_MATERIAL_IN_258,
          )
            ? handleExport
            : undefined
        }
      />
    </BoxForm>
  )
})

export default Filter
