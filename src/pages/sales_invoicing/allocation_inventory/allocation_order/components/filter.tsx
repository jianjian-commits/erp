import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  BoxFormMore,
  MoreSelectDataItem,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/store'
import FilterButton from '@/common/components/filter_button'
import { STOCK_PRINT_STATUS } from '@/pages/sales_invoicing/enum'
import globalStore from '@/stores/global'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { TimeType } from '@/pages/sales_invoicing/allocation_inventory/enum'
import { MoreSelect_Warehouse } from 'gm_api/src/inventory/pc'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE_TIME,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_SUBMIT_TIME,
    name: '按审核时间',
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
      out_warehouse_id,
      in_warehouse_id,
      printed,
      creator_ids,
      submitter_ids,
      auditor_ids,
    },
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
    store.handleExport().then(() => {
      globalStore.showTaskPanel()
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
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              store.changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入调拨单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('调出仓库')}>
            <MoreSelect_Warehouse
              value={out_warehouse_id}
              placeholder='请选择调出仓库'
              onChange={(value) => {
                store.changeFilter('out_warehouse_id', value as string)
              }}
            />
          </FormItem>
          <FormItem label={t('调入仓库')}>
            <MoreSelect_Warehouse
              value={in_warehouse_id}
              placeholder='请选择调入仓库'
              params={{ all: true }}
              onChange={(value) => {
                store.changeFilter('in_warehouse_id', value as string)
              }}
            />
          </FormItem>
          <FormItem label={t('打印状态')}>
            <Select
              value={printed}
              data={STOCK_PRINT_STATUS}
              onChange={(value) => {
                store.changeFilter('printed', value)
              }}
            />
          </FormItem>
          <FormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected: MoreSelectDataItem[]) => {
                store.changeFilter('creator_ids', selected)
              }}
              getName={(item) => item.name!}
            />
          </FormItem>
          <FormItem label={t('提交人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择提交人')}
              selected={submitter_ids}
              renderListFilterType='pinyin'
              onSelect={(selected: MoreSelectDataItem[]) => {
                store.changeFilter('submitter_ids', selected)
              }}
              getName={(item) => item.name!}
            />
          </FormItem>
          <FormItem label={t('审核人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择审核人')}
              selected={auditor_ids}
              renderListFilterType='pinyin'
              onSelect={(selected: MoreSelectDataItem[]) => {
                store.changeFilter('auditor_ids', selected)
              }}
              getName={(item) => item.name!}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FilterButton loading={loading} onExport={handleExport} />
    </BoxForm>
  )
})

export default Filter
