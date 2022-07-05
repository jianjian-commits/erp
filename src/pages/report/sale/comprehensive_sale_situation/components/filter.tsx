import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'

import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import { NORMALIZES } from '@/common/enum'

import { FilterProps } from '../../interface'
import { SynthesizeSaleFilter } from '../types'
import { FORMS_CONFIGS, INITIALVALUES } from '../../constants'
import store from '../store'

const initialValues = {
  time_range: INITIALVALUES.time_range,
}

export const Filter: FC<FilterProps> = observer(({ onExport }) => {
  const form = useControlFormRef<SynthesizeSaleFilter>()

  const filterBarProps: FilterBarProps<SynthesizeSaleFilter> = {
    form,
    initialValues,
    isSubmitInit: true,
    normalizes: {
      time_range: NORMALIZES.time_range,
    },
    basicForms: [FORMS_CONFIGS.time_range],
    onSubmit: store.updateFilter,
    onExport,
  }
  return <FilterBar<SynthesizeSaleFilter> {...filterBarProps} />
})
