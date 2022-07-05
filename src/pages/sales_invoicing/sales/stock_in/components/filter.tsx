import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  FormItem,
  Input,
  FormBlock,
  BoxForm,
  BoxFormMore,
  MoreSelect,
  Select,
  Flex,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'
import styled from 'styled-components'

import store from '../stores/list_store'
import FilterButton from '@/common/components/filter_button'
import { SELECT_TYPE } from '../enum'
import { SelectType } from '../interface'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

const StyledSelect = styled(Select)`
  width: 110px;
  margin-left: -10px;
`

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
      customer_label_selected,
      searchType,
      creator_ids,
      warehouse_id,
    },
    customerLabelList,
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
    <BoxForm labelWidth='140px' colWidth='385px' inline onSubmit={onSearch}>
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
                store.changeFilter('warehouse_id', selected)
              }}
              placeholder={t('请选择仓库')}
            />
          </FormItem>
        )}
        <FormItem>
          <Flex>
            <div className='gm-padding-right-5'>
              <StyledSelect
                data={SELECT_TYPE}
                value={searchType}
                onChange={(value: SelectType) =>
                  store.changeFilter('searchType', value)
                }
                clean
              />
            </div>

            <Input
              value={q}
              onChange={(e) => {
                store.changeFilter('q', e.target.value)
              }}
              placeholder={
                searchType === 'q'
                  ? t('请输入销售退货入库单号搜索')
                  : t('请输入订单号搜索')
              }
            />
          </Flex>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('客户标签')}>
            <MoreSelect
              renderListFilterType='pinyin'
              multiple
              data={customerLabelList.slice()}
              selected={customer_label_selected}
              onSelect={(selected) => {
                store.changeFilter('customer_label_selected', selected)
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
        </FormBlock>
      </BoxFormMore>
      <FilterButton onExport={handleExport} loading={loading} />
    </BoxForm>
  )
})

export default Filter
