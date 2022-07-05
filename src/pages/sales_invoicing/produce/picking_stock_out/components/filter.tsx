import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  ControlledFormItem,
  FormBlock,
  Input,
  LevelSelect,
  Select,
} from '@gm-pc/react'

import { Permission } from 'gm_api/src/enterprise'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'

import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import FilterButton from '@/common/components/filter_button'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

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
    changeFilter,
    getProcessorList,
  } = ListSotre

  const { onSearch, loading } = props

  const handleDateChange: DRFOnChange = (value) => {
    const { dateType, begin, end } = value
    if (dateType) {
      changeFilter('time_type', dateType)
    }
    if (begin && end) {
      changeFilter('begin_time', begin)
      changeFilter('end_time', end)
    }
  }

  const handleExport = () => {
    ListSotre.exportMaterialOutStockSheet().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  useEffect(() => {
    // 获取 filter 领用部门
    getProcessorList()
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
          <ControlledFormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value) => {
                changeFilter('warehouse_id', value)
              }}
            />
          </ControlledFormItem>
        )}
        <ControlledFormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入领料出库单号')}
          />
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <ControlledFormItem label={t('打印状态')}>
            <Select
              value={is_printed}
              data={STOCK_PRINT_STATUS}
              onChange={(value) => {
                changeFilter('is_printed', value)
              }}
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected) => changeFilter('creator_ids', selected)}
              getName={(item) => item.name!}
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('领用部门')}>
            <LevelSelect
              selected={processor_ids.slice()}
              placeholder={t('请选择领用部门')} // 需要更新组件库支持placeholder
              data={processors.slice()}
              onSelect={(value) => {
                changeFilter('processor_ids', value)
              }}
            />
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <FilterButton
        loading={loading}
        onExport={
          globalStore.hasPermission(
            Permission.PERMISSION_INVENTORY_EXPORT_MATERIAL_OUT,
          )
            ? handleExport
            : undefined
        }
      />
    </BoxForm>
  )
})

export default Filter
