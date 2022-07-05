import {
  Box,
  Form,
  FormItem,
  FormBlock,
  DateRangePicker,
  FormButton,
  Button,
  MoreSelect,
  MoreSelectDataItem,
} from '@gm-pc/react'
import React, { FC, memo, useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { t } from 'gm-i18n'

import { getTimestamp } from '@/common/util'
import _ from 'lodash'
import {
  list_Task_State,
  Task_State,
  Task_TimeType,
} from 'gm_api/src/production'
import SearchFilter from './search_filter'

interface FilterType {
  begin_time: Date | null
  end_time: Date | null
  q: string
  serial_no: string
  sku_ids?: string[] // sku_ids 和 input_sku_ids必须传一个
  input_sku_ids?: string[]
  states?: MoreSelectDataItem<string>[]
  time_type: Task_TimeType
  need_details?: boolean
}

const planStatus = _.filter(list_Task_State, (item) => {
  if (
    item.value === Task_State.STATE_STARTED ||
    item.value === Task_State.STATE_FINISHED
  ) {
    return true
  } else {
    return false
  }
})

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  states: planStatus,
  q: '',
  serial_no: '',
  sku_ids: undefined,
  input_sku_ids: undefined,
  time_type: Task_TimeType.TIME_TYPE_CREATE,
}

interface FilterProps {
  onSearch: (filter: any) => void
  defaultFilter?: Partial<FilterType>
  loading: boolean
}

const Filter: FC<FilterProps> = (props) => {
  const { onSearch, loading, defaultFilter } = props

  const searchRef = useRef(onSearch)

  const [filter, setFilter] = useState<FilterType>({
    ...initFilter,
    ...defaultFilter,
  })

  const handleDateChange = (begin_time: Date | null, end_time: Date | null) => {
    setFilter({
      ...filter,
      begin_time,
      end_time,
    })
  }

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = () => {
    searchRef.current({
      ...filter,
      begin_time: getTimestamp(filter.begin_time),
      end_time: getTimestamp(filter.end_time),
      states: _.map(filter.states, (item) => item.value),
    })
  }

  return (
    <Box hasGap>
      <Form labelWidth='70px' colWidth='180px' onSubmit={handleSearch} inline>
        <FormBlock col={3}>
          <FormItem label={t('创建时间')} col={2}>
            <DateRangePicker
              begin={filter.begin_time}
              end={filter.end_time}
              enabledTimeSelect
              onChange={handleDateChange}
            />
          </FormItem>

          <FormItem label={t('计划状态')}>
            <MoreSelect
              selected={filter.states}
              onSelect={(value) =>
                setFilter({ ...filter, states: value as any })
              }
              data={planStatus}
              multiple
              placeholder={t('请选择计划状态')}
            />
          </FormItem>

          <FormItem col={2}>
            <SearchFilter
              value={{
                serial_no: filter.serial_no || '',
                sku_name: filter.q || '',
              }}
              onChange={(key, value) =>
                setFilter((pre) => {
                  return { ...pre, [key]: value }
                })
              }
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit' disabled={loading}>
            {t('搜索')}
          </Button>
        </FormButton>
      </Form>
    </Box>
  )
}

export default memo(Filter)
export type { FilterType }
