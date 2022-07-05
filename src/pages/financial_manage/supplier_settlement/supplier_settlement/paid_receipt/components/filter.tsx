import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Select,
  FormItem,
  FormBlock,
  BoxForm,
  MoreSelectDataItem,
  DateRangePicker,
  BoxFormMore,
} from '@gm-pc/react'
import { t } from 'gm-i18n'

import store from '../store'
import FilterButton from '@/common/components/filter_button'

import { MoreSelect_Supplier } from 'gm_api/src/enterprise/pc'

import { SUPPLIER_CREDIT_TYPE } from '../../enum'
import globalStore from '@/stores/global'

interface FilterProps {
  onSearch: () => any
  loading: boolean
}

const Filter: FC<FilterProps> = observer((props) => {
  const {
    filter: { begin_time, end_time, supplierSelected, payment_method },
  } = store
  const { onSearch, loading } = props

  const handleDateChange = (begin: Date, end: Date) => {
    if (begin && end) {
      store.changeFilter('begin_time', begin)
      store.changeFilter('end_time', end)
    }
  }

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' inline onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按建单日期')}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            onChange={handleDateChange}
            enabledTimeSelect
          />
        </FormItem>

        <FormItem label={t('供应商')}>
          <MoreSelect_Supplier
            selected={supplierSelected}
            onSelect={(selected: MoreSelectDataItem<string>[]) =>
              store.changeFilter('supplierSelected', selected)
            }
            placeholder={t('请选择供应商')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('结算周期')}>
            <Select
              all
              value={payment_method}
              data={SUPPLIER_CREDIT_TYPE}
              onChange={(value) => {
                store.changeFilter('payment_method', value)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>

      <FilterButton onExport={handleExport} loading={loading} />
    </BoxForm>
  )
})

export default Filter
