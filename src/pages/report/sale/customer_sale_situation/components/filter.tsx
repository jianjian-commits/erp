import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { useControlFormRef } from '@gm-pc/react'

import { Select_GroupUser } from 'gm_api/src/enterprise/pc'

import { FilterBar, FilterBarProps } from '@/common/components/filter_bar'
import { Placeholders, NORMALIZES } from '@/common/enum'

import { FilterProps } from '../../interface'
import { FORMS_CONFIGS, INITIALVALUES } from '../../constants'
import store, { CustomerSaleFilter } from '../store'
import globalStore from '@/stores/global'

const initialValues = {
  time_range: INITIALVALUES.time_range,
}

export const Filter: FC<FilterProps> = observer(({ onExport }) => {
  const form = useControlFormRef<CustomerSaleFilter>()

  const filterBarProps: FilterBarProps<CustomerSaleFilter> = {
    form,
    initialValues,
    isSubmitInit: true,
    normalizes: {
      time_range: NORMALIZES.time_range,
    },
    basicForms: [
      FORMS_CONFIGS.time_range,
      {
        label: t('销售经理'),
        name: 'customer_sales_group_user_id',
        hide: globalStore.isLite,
        component: <Select_GroupUser all={{ value: undefined }} />,
      },
      {
        label: '搜索',
        name: 'customer_name',
        type: 'Input',
        componentProps: {
          placeholder: Placeholders.CUSTOMER_NAME,
        },
      },
    ],
    onSubmit: store.updateFilter,
    onExport,
  }
  return <FilterBar<CustomerSaleFilter> {...filterBarProps} />
})
