import { t } from 'gm-i18n'

const addFields = {
  [t('基础')]: [
    { key: t('商品名'), value: '{{SKU}}' },
    { key: t('商品编码'), value: '{{SKU_ID}}' },
    { key: t('实称数（基本单位）'), value: '{{实称数_基本单位}}' },
    { key: t('保质期'), value: '{{保质期}}' },
    { key: t('计划交期'), value: '{{计划交期}}' },
    { key: t('打印时间'), value: '{{当前时间_年月日}}' },
    { key: t('产品组成'), value: '{{产品组成}}' },
  ],
  [t('配送')]: [
    { key: t('商户名'), value: '{{商户名}}' },
    { key: t('商户编码'), value: '{{商户编码}}' },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{页码}}' }],
}

export default addFields
