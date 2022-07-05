import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormButton,
  Button,
  DateRangePicker,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'

interface DateFilterProps {
  end: Date
  begin: Date
  onChange(begin: Date, end: Date): void
  onSearch: () => void
}

const DateFilter: FC<DateFilterProps> = ({
  end,
  begin,
  onChange,
  onSearch,
}) => {
  return (
    <BoxForm

      labelWidth='100px'
      colWidth='365px'
      onSubmit={onSearch}
    >
      <FormBlock col={3}>
        <Observer>
          {() => {
            return (
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={(begin: Date, end: Date) => onChange(begin, end)}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit' className='gm-margin-left-20'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(DateFilter)
