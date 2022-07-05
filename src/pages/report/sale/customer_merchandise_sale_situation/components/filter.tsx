import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'

import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import { NORMALIZES } from '@/common/enum'

import { FilterProps } from '../../interface'
import { FORMS_CONFIGS, INITIALVALUES } from '../../constants'
import store, { CustomerMerchandiseSaleFilter } from '../store'

export const Filter: FC<FilterProps> = observer(({ onExport }) => {
  const form = useControlFormRef<CustomerMerchandiseSaleFilter>()

  const filterBarProps: FilterBarProps<CustomerMerchandiseSaleFilter> = {
    form,
    isSubmitInit: true,
    initialValues: INITIALVALUES,
    normalizes: {
      time_range: NORMALIZES.time_range,
      category: NORMALIZES.category,
    },
    basicForms: [
      FORMS_CONFIGS.time_range,
      FORMS_CONFIGS.sku_name,
      FORMS_CONFIGS.customer_name,
    ],
    moreForms: [FORMS_CONFIGS.category],
    onExport,
    onSubmit: store.updateFilter,
  }
  return <FilterBar<CustomerMerchandiseSaleFilter> {...filterBarProps} />
})
