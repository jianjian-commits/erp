import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'
import { Placeholders, NORMALIZES } from '@/common/enum'

import { FilterBar, FilterBarProps } from '@/common/components'

import { FilterProps } from '../../interface'
import store, { MerchandiseSaleFilter } from '../store'
import { FORMS_CONFIGS, INITIALVALUES } from '../../constants'

export const Filter: FC<FilterProps> = observer(({ onExport }) => {
  const form = useControlFormRef<MerchandiseSaleFilter>()

  const filterBarProps: FilterBarProps<MerchandiseSaleFilter> = {
    form,
    isSubmitInit: true,
    initialValues: INITIALVALUES,
    normalizes: {
      time_range: NORMALIZES.time_range,
      category: NORMALIZES.category,
    },
    basicForms: [
      FORMS_CONFIGS.time_range,
      FORMS_CONFIGS.category,
      {
        label: '商品',
        name: 'sku_name',
        type: 'Input',
        componentProps: {
          placeholder: Placeholders.MERCHANDISE_NAME,
          style: {
            width: 230,
          },
        },
      },
    ],
    onSubmit: store.updateFilter,
    onExport,
  }

  return <FilterBar<MerchandiseSaleFilter> {...filterBarProps} />
})
