import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('交期时间'), value: '{{交期时间}}' },
    { key: t('物料数量'), value: '{{物料数量}}' },
    { key: t('打印时间'), value: '{{打印时间}}' },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{当前页码}} / {{页码总数}}' }],
}

const tableFields = {
  [t('基础')]: [
    { key: t('序号'), value: '{{列.序号}}' },
    { key: t('物料分类'), value: '{{列.物料分类}}' },
    { key: t('物料名称'), value: '{{列.物料名称}}' },
    { key: t('物料类型'), value: '{{列.物料类型}}' },
    { key: t('需求数（基本单位）'), value: '{{列.需求数_基本单位}}' },
    { key: t('需求数（生产单位）'), value: '{{列.需求数_生产单位}}' },
    { key: t('菜品明细'), value: '{{列.菜品明细}}' },
    { key: t('原料明细'), value: '{{列.原料明细}}' },
    { key: t('车间或小组名称'), value: '{{列.车间或小组名称}}' },
    { key: t('仓库名称'), value: '{{列.仓库名称}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
