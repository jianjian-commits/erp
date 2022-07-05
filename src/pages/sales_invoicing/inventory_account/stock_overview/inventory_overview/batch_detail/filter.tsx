import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  DateRangePicker,
  FormButton,
  Button,
} from '@gm-pc/react'

import store, { FtType } from '../stores/batch_store'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { begin_time, end_time },
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
        <FormItem label={t('操作时间')} colWidth='350px'>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
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
