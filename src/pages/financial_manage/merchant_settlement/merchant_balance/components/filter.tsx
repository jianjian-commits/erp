import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { BoxForm, FormBlock, FormItem } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import FilterButton from '@/common/components/filter_button'
import store from '../store'
import CustomerFilter from './customer_filter'
import globalStore from '@/stores/global'

interface Props {
  onSearch?: () => Promise<any>
}

const Filter: FC<Props> = ({ onSearch }) => {
  const handleExport = () => {
    store.exportAccountBalance().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm labelWidth='85px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('公司筛选')}>
          <Observer>
            {() => (
              <CustomerFilter
                value={store.filter.customers}
                onChange={(v) => store.updateFilter('customers', v)}
              />
            )}
          </Observer>
        </FormItem>
      </FormBlock>
      <FilterButton onExport={handleExport} />
    </BoxForm>
  )
}

export default observer(Filter)
