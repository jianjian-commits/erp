import { t } from 'gm-i18n'

const addFields = {
  [t('基础')]: [
    { key: t('学校名称'), value: '{{学校名称}}' },
    { key: t('班级名称'), value: '{{班级名称}}' },
    { key: t('商品描述'), value: '{{商品描述}}' },
    { key: t('打印时间'), value: '{{当前时间_年月日}}' },
    // mes字段
    { key: t('单箱重量'), value: '{{单箱重量}}' },
    { key: t('单箱数量'), value: '{{单箱数量}}' },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{当前页码}}/{{页码总数}}' }],
}

export default {
  commonFields: addFields,
}
