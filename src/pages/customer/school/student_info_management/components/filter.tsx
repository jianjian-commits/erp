import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { BoxForm, FormItem, FormButton, Button } from '@gm-pc/react'
import ClassFilter from '@/common/components/class_filter'
import store from '../store'
import type { FilterOption } from '../store'
import SearchFilter from './search_filter'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = ({ onSearch }) => {
  const handleFilter = <T extends keyof FilterOption>(
    key: T,
    value: FilterOption[T],
  ) => {
    store._updateFilter(key, value)
  }

  return (
    <BoxForm onSubmit={onSearch}>
      <FormItem label={t('班级筛选')}>
        <Observer>
          {() => {
            const { select } = store.filter
            return (
              <ClassFilter
                selected={select}
                onChange={(value, schoolId_map_classIds) => {
                  const value_ = Object.assign({}, value, {
                    schoolId_map_classIds,
                  })
                  handleFilter('select', value_)
                }}
              />
            )
          }}
        </Observer>
      </FormItem>
      <FormItem>
        <Observer>
          {() => {
            const { student_name, parent_name } = store.filter
            return (
              <SearchFilter
                value={{
                  student_name: student_name || '',
                  parent_name: parent_name || '',
                }}
                onChange={(key, value) => {
                  handleFilter(key, value)
                }}
              />
            )
          }}
        </Observer>
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
