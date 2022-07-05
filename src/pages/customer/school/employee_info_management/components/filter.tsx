import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Input,
} from '@gm-pc/react'
import ClassFilter from '@/common/components/class_filter'
import type { FilterOption } from '../store'
import store from '../store'

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
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
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
        <FormItem label={t('职工姓名')}>
          <Observer>
            {() => {
              const { stall_name } = store.filter
              return (
                <Input
                  className='gm-inline-block form-control'
                  value={stall_name}
                  onChange={(e) => handleFilter('stall_name', e.target.value)}
                  placeholder={t('请输入职工姓名搜索')}
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
