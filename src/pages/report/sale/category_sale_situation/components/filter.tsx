import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'

import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import { NORMALIZES } from '@/common/enum'

import store, { CategorySaleFilter, CategoryReportTab } from '../store'
import { FilterProps } from '../../interface'
import { FORMS_CONFIGS, INITIALVALUES } from '../../constants'
import { CategoryFilter } from '@/common/components'

export const Filter: FC<FilterProps & { category: CategoryReportTab }> =
  observer(({ onExport, category }) => {
    const form = useControlFormRef<CategorySaleFilter>()

    const filterBarProps: FilterBarProps<CategorySaleFilter> = {
      form,
      initialValues: INITIALVALUES,
      isSubmitInit: true,
      normalizes: {
        time_range: NORMALIZES.time_range,
        category: NORMALIZES.category,
      },
      basicForms: [
        FORMS_CONFIGS.time_range,
        {
          label: '商品分类',
          name: 'category',
          valuePropName: 'selected',
          component: (
            <CategoryFilter
              level={category as any}
              multiple
              style={{ width: 275 }}
            />
          ),
        },
      ],
      onSubmit: store.updateFilter,
      onExport,
    }
    return <FilterBar<CategorySaleFilter> {...filterBarProps} />
  })
