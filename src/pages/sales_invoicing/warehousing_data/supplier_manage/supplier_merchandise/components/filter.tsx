import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'
import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import { FilterProps } from '../interface'
import { INITIALVALUES, FORMS_CONFIGS } from '../constants'

import store from '../store/store'

const Filter: FC<FilterProps> = observer(({ onExport }) => {
  const form = useControlFormRef()
  const filterBarProps: FilterBarProps = {
    form,
    isSubmitInit: true,
    initialValues: INITIALVALUES,
    normalizes: {
      category: store.dealCategory,
    },
    basicForms: [FORMS_CONFIGS.category, FORMS_CONFIGS.q],
    onExport,
    onSubmit: store.changeFilter,
  }
  return <FilterBar {...filterBarProps} />
})
export default Filter
