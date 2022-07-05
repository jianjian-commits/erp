import React from 'react'
import { FormConfig } from '@/common/components'
import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import { t } from 'gm-i18n'
const INITIALVALUES = {
  category: {
    category1_ids: [],
    category2_ids: [],
  },
  q: '',
}
const TEMP_FORMS_CONFIGS = {
  category: {
    label: t('商品分类'),
    name: 'category',
    valuePropName: 'selected',
    col: 2,
    component: <CategoryPinleiFilter disablePinLei />,
  },
  q: {
    label: '搜索',
    name: 'q',
    type: 'Input',
    componentProps: {
      placeholder: t('输入自定义编码或者商品名'),
    },
  },
}
const FORMS_CONFIGS = TEMP_FORMS_CONFIGS as {
  [key in keyof typeof TEMP_FORMS_CONFIGS]: FormConfig
}

export { INITIALVALUES, FORMS_CONFIGS }
