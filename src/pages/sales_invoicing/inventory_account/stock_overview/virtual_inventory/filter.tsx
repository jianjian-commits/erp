import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  DateRangePicker,
  Input,
  FormButton,
  Button,
  Select,
} from '@gm-pc/react'
import { CategoryFilter } from '@/common/components'

import store, { FtType } from './store'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import globalStore from '@/stores/global'

interface Pros {
  onSearch: () => any
}

const Filter: FC<Pros> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { begin_time, end_time, q, warehouse_id },
  } = store

  const handleFilterChange = <T extends keyof FtType>(
    key: T,
    value: FtType[T],
  ) => {
    store.handleChangeFilter(key, value)
  }

  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      handleFilterChange('begin_time', begin_time)
      handleFilterChange('end_time', end_time)
    }
  }

  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock>
        <FormItem label={t('按出库时间')} colWidth='375px'>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('选择仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value: string) => {
                handleFilterChange('warehouse_id', value)
              }}
            />
          </FormItem>
        )}

        <FormItem label={t('商品筛选')}>
          <CategoryFilter
            onChange={(e) => handleFilterChange('category_id', e)}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={t('输入商品名、编号或关联单据号搜索')}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
      </FormButton>
    </BoxForm>
  )
})

export default Filter
