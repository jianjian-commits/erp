import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { useControlFormRef } from '@gm-pc/react'

import DateRangeFilter from '@/common/components/date_range_filter'
import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import { SaleFilter } from '../interface'

interface FilterProps {
  onExport?: (...arg: any) => Promise<any>
  updateFilter: (filter: SaleFilter) => void
  fuzzySearchField?: keyof Pick<SaleFilter, 'customer_name' | 'supplier_name'>
  dateType: string
  placeholder: string
  dateRangePickerFileds: Array<{
    type: number | string
    name: string
    expand: boolean
    limit?: (
      date: Date,
      v: {
        begin?: Date
        end?: Date
      },
    ) => boolean
  }>
}

export default observer((props: FilterProps) => {
  const {
    placeholder,
    updateFilter,
    dateRangePickerFileds,
    dateType,
    onExport,
    fuzzySearchField,
  } = props
  const form = useControlFormRef<SaleFilter>()

  const initialValues = {
    time_range: {
      begin: moment().startOf('day').toDate(),
      end: moment().endOf('day').toDate(),
      dateType: dateType,
    },
  }

  const filterBarProps: FilterBarProps<SaleFilter> = {
    form,
    initialValues,
    isSubmitInit: true,
    normalizes: {
      time_range: ({ dateType, begin, end }) => {
        return {
          begin_time: `${+begin}`,
          end_time: `${+end}`,
          time_field: dateType,
        }
      },
    },
    basicForms: [
      {
        name: 'time_range',
        component: (
          <DateRangeFilter data={dateRangePickerFileds} enabledTimeSelect />
        ),
      },
      {
        label: t('搜索'),
        name: fuzzySearchField,
        type: 'Input',
        componentProps: {
          placeholder: placeholder,
        },
      },
    ],
    onSubmit: updateFilter,
    onExport,
  }

  return <FilterBar<SaleFilter> {...filterBarProps} />
})
