import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { BoxForm, FormBlock, FormItem, DateRangePicker } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import FilterButton from '@/common/components/filter_button'
import store from '../store'
import globalStore from '@/stores/global'

interface Props {
  onSearch?: () => Promise<any>
}

const Filter: FC<Props> = ({ onSearch }) => {
  const handleExport = () => {
    store.exportFlow().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  return (
    <BoxForm labelWidth='85px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('变动时间')}>
          <Observer>
            {() => {
              const { begin_time, end_time } = store.filter
              return (
                <DateRangePicker
                  begin={begin_time}
                  end={end_time}
                  onChange={(begin: Date, end: Date) => {
                    store.setChangeTime(begin, end)
                  }}
                  enabledTimeSelect
                  timeSpan={60 * 60 * 1000}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <FilterButton onExport={handleExport} />
    </BoxForm>
  )
}

export default observer(Filter)
