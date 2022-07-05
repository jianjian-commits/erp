import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { FormItem, Input, FormBlock, BoxForm, BoxFormMore } from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../stores/store'
import FilterButton from '@/common/components/filter_button'
import globalStore from '@/stores/global'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { TimeType } from 'gm_api/src/inventory'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import { useEffectOnce } from '@/common/hooks'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_SUBMIT,
    name: '按出库时间',
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
  useEffectOnce(onSearch, warehouse_id)

  return (
    <BoxForm labelWidth='100px' colWidth='385px' inline onSubmit={onSearch}>
      <FormBlock col={2}>
        <DateRangeFilter
          data={dateFilterData}
          value={{ begin: begin_time, end: end_time, dateType: time_type }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        <FormItem label={t('仓库')}>
          <Select_WareHouse_Default
            value={warehouse_id}
            onChange={(value) => {
              store.changeFilter('warehouse_id', value)
            }}
          />
        </FormItem>
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
        </FormBlock>
      </BoxFormMore>
      <FilterButton loading={loading} onExport={handleExport} />
    </BoxForm>
  )
})

export default Filter
