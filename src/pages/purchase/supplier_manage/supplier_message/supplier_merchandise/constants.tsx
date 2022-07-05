import React from 'react'
import { FormConfig } from '@/common/components'
import CategoryFilter from '@/common/components/category_filter'
import { t } from 'gm-i18n'
const INITIALVALUES = {
  category_id: '',
  q: '',
}
const TEMP_FORMS_CONFIGS = {
  category: {
    label: t('商品分类'),
    name: 'category_id',
    valuePropName: 'selected',
    component: (
      <CategoryFilter
        placeholder={t('请选择商品分类')}
        style={{ width: 275 }}
      />
    ),
  },
  q: {
    label: '搜索',
    name: 'q',
    type: 'Input',
    componentProps: {
      placeholder: t('输入商品编码和商品名称'),
    },
  },
}
const FORMS_CONFIGS = TEMP_FORMS_CONFIGS as {
  [key in keyof typeof TEMP_FORMS_CONFIGS]: FormConfig
}

export { INITIALVALUES, FORMS_CONFIGS }
