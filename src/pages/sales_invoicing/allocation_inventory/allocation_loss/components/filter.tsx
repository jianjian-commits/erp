import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { FormItem, Input, BoxFormMore, FormBlock, BoxForm } from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/store'
import FilterButton from '@/common/components/filter_button'
import globalStore from '@/stores/global'
import { TimeType } from 'gm_api/src/inventory'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_SUBMIT,
    name: '按提交时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_ORDER_RECEIVE,
    name: '按完成时间',
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
      in_warehouse_id,
      out_warehouse_id,
      warehouse_transfer_sheet_serial_no,
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
    store.handleExport().then((json) => {
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
        <FormItem label={t('搜索')}>
          <Input
            value={warehouse_transfer_sheet_serial_no}
            onChange={(e) => {
              store.changeFilter(
                'warehouse_transfer_sheet_serial_no',
                e.target.value,
              )
            }}
            placeholder={t('请输入调拨单号')}
          />
        </FormItem>
        <BoxFormMore>
          <FormBlock col={3}>
            <FormItem label={t('调出仓库')}>
              <Select_Warehouse
                value={out_warehouse_id}
                style={{
                  maxWidth: '260px',
                }}
                onChange={(value) => {
                  store.changeFilter('out_warehouse_id', value)
                }}
              />
            </FormItem>
            <FormItem label={t('调入仓库')}>
              <Select_Warehouse
                style={{
                  maxWidth: '260px',
                }}
                value={in_warehouse_id}
                onChange={(value) => {
                  store.changeFilter('in_warehouse_id', value)
                }}
              />
            </FormItem>
          </FormBlock>
        </BoxFormMore>
      </FormBlock>
      <FilterButton loading={loading} onExport={handleExport} />
    </BoxForm>
  )
})

export default Filter
