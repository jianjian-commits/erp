import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  FormBlock,
  BoxForm,
  MoreSelectDataItem,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'

import store from '../store'
import FilterButton from '@/common/components/filter_button'

import { MoreSelect_Supplier } from 'gm_api/src/enterprise/pc'
import { SHEET_TYPE } from '../../enum'
import globalStore from '@/stores/global'

const dateFilterData = [
  {
    type: 1,
    name: '按建单时间',
    expand: false,
  },
  {
    type: 2,
    name: '按入库/退货时间',
    expand: false,
  },
]

interface FilterProps {
  onSearch: () => any
}

const Filter: FC<FilterProps> = observer((props) => {
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      stock_sheet_type,
      supplierSelected,
    },
  } = store
  const { onSearch } = props
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

        <FormItem label={t('供应商')}>
          <MoreSelect_Supplier
            selected={supplierSelected}
            // eslint-disable-next-line react/jsx-handler-names
            onSelect={(selected: MoreSelectDataItem<string>[]) =>
              store.changeFilter('supplierSelected', selected)
            }
            placeholder={t('请选择供应商')}
          />
        </FormItem>
        <FormItem label={t('单据类型')}>
          <Select
            all
            value={stock_sheet_type}
            data={SHEET_TYPE}
            onChange={(value) => {
              store.changeFilter('stock_sheet_type', value)
            }}
          />
        </FormItem>
      </FormBlock>

      <FilterButton onExport={handleExport} />
    </BoxForm>
  )
})

export default Filter
