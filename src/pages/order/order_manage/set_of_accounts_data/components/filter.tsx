import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  Input,
  ControlledFormItem,
  FormButton,
  Button,
} from '@gm-pc/react'

import DateRangeFilter from '@/common/components/date_range_filter'
import { dateFilterData } from '../../../util'
import {
  GetFakeOrderByCustomerRequest,
  GetFakeOrderByCustomerResponse,
} from 'gm_api/src/databi'
import { ExportFakeOrderData } from 'gm_api/src/orderlogic'
import { PagingParams } from 'gm_api/src/common'
import globalStore from '@/stores/global'

import { t } from 'gm-i18n'
import store, { F } from '../store'

interface FilterProps {
  onSearch: (
    params?: GetFakeOrderByCustomerRequest,
  ) => Promise<GetFakeOrderByCustomerResponse>
  onExport: () => void
}

const Filter: FC<FilterProps> = observer((props) => {
  const { setFilter } = store
  useEffect(() => handleReset, [])

  const handleSearch = () => {
    console.log('value')
    //
    props.onSearch()
  }

  const handleExport = () => {
    //
    props.onExport().then((res) => {
      globalStore.showTaskPanel()
    })
  }

  function handleReset(): void {
    store.initFilter()
  }

  const handleDateChange = (value: {
    begin?: Date
    end?: Date
    dateType?: number
  }) => {
    if (value.dateType) {
      setFilter('dateType', value.dateType)
    }
    if (value.begin && value.end) {
      setFilter('begin', value.begin)
      setFilter('end', value.end)
    }
  }

  return (
    <BoxForm<F> labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <Observer>
          {() => {
            const { begin, end, dateType } = store.filter
            return (
              <DateRangeFilter
                data={dateFilterData}
                value={{ begin, end, dateType }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <ControlledFormItem label={t('搜索')}>
          <Input
            placeholder={t('输入客户名称进行搜索')}
            value={store.filter.search_text}
            onChange={(e) => setFilter('search_text', e.target.value)}
          />
        </ControlledFormItem>
      </FormBlock>

      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>

        <Button onClick={handleExport} className='gm-margin-left-10'>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
