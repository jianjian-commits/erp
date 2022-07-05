import React, { useEffect, useState } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  MoreSelectDataItem,
  DateRangePicker,
  MoreSelect,
} from '@gm-pc/react'
import _ from 'lodash'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import store from '../store'
import type { FilterOptions, levelList } from '../store'

const Filter = () => {
  const [schoolList, setSchoolList] = useState<levelList[]>([])

  // 获取学校列表
  useEffect(() => {
    ListCustomer({
      level: 1,
      paging: { limit: 999 },
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers } = json.response
      const list = _.map(customers, (item) => ({
        original: item,
        value: item.customer_id,
        text: item.name,
      }))
      setSchoolList(list)
      return json.response
    })
  }, [])

  const handleFilterChange = <T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleSearch = () => {
    store.fetchSettlementList()
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按收货日期')}>
          <Observer>
            {() => {
              const { begin, end } = store.filter
              return (
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={(begin: Date, end: Date) => {
                    handleFilterChange('begin', begin)
                    handleFilterChange('end', end)
                  }}
                />
              )
            }}
          </Observer>
        </FormItem>
        <FormItem label={t('学校筛选')}>
          <Observer>
            {() => {
              const { selected_school } = store.filter

              return (
                <MoreSelect
                  data={schoolList}
                  selected={selected_school}
                  placeholder={t('请选择学校')}
                  multiple
                  onSelect={(select: MoreSelectDataItem<string>[]) => {
                    handleFilterChange('selected_school', select)
                  }}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
