import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  DateRangePicker,
  FormBlock,
  Input,
  FormItem,
  FormButton,
  Button,
} from '@gm-pc/react'

import store, { FilterType } from '../stores/store'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { q, begin_time, end_time, creator_ids },
  } = store
  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.changeFilter(key, value)
  }
  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      store.changeFilter('begin_time', begin_time)
      store.changeFilter('end_time', end_time)
    }
  }
  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按建单时间')} colWidth='400px'>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={t('请输入货值调整单号')}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
