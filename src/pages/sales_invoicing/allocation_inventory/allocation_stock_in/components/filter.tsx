import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  MoreSelectDataItem,
  BoxFormMore,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/store'
import FilterButton from '@/common/components/filter_button'
import globalStore from '@/stores/global'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { TimeType } from 'gm_api/src/inventory'
import Select_Warehouse_Default from '@/common/components/select_warehouse'

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
]

interface FilterProps {
  onSearch: () => any
  loading: boolean
}

const Filter: FC<FilterProps> = observer((props) => {
  const {
    filter: { begin_time, end_time, time_type, q, warehouse_id, creator_ids },
    changeFilter,
  } = store
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

  // 导出先不做
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
        <FormItem label={t('选择仓库')}>
          <Select_Warehouse_Default
            value={warehouse_id}
            onChange={(value) => {
              changeFilter('warehouse_id', value)
            }}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入调拨单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected: MoreSelectDataItem[]) =>
                changeFilter('creator_ids', selected)
              }
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
