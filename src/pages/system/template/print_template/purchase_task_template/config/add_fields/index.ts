import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('打印时间'), value: '{{当前时间}}' },
    { key: i18next.t('采购经办'), value: '{{采购员}}' },
    { key: i18next.t('采购单位'), value: '{{采购单位}}' },
    { key: i18next.t('供应商'), value: '{{供应商}}' },
    { key: i18next.t('供应商编号'), value: '{{供应商编号}}' },
    { key: i18next.t('任务数'), value: '{{任务数}}' },
    { key: i18next.t('采购员电话'), value: '{{采购员电话}}' },
    { key: i18next.t('供应商电话'), value: '{{供应商电话}}' },
  ],
  [i18next.t('其他')]: [
    { key: i18next.t('页码'), value: '{{当前页码}} / {{页码总数}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: '{{列.序号}}' },
    { key: i18next.t('商品名称'), value: '{{列.商品名称}}' },
    { key: i18next.t('分类'), value: '{{列.分类}}' },
    { key: i18next.t('商品编码'), value: '{{列.商品编码}}' },
    { key: i18next.t('计划波次'), value: '{{列.计划波次}}' },
    { key: i18next.t('商品等级'), value: '{{列.商品等级}}' },
    { key: i18next.t('备注'), value: '{{列.备注}}' },
  ],
  [i18next.t('数量')]: [
    { key: i18next.t('库存'), value: '{{列.库存}}' },
    {
      key: i18next.t('需求数(采购单位)'),
      value: '{{列.需求数_采购单位}}{{列.采购单位}}',
    },
    {
      key: i18next.t('计划采购(采购单位)'),
      value: '{{列.计划采购_采购单位}}{{列.采购单位}}',
    },
    {
      key: i18next.t('已采购(采购单位)'),
      value: '{{列.已采购_采购单位}}{{列.采购单位}}',
    },
    {
      key: i18next.t('实采'),
      value: '{{列.实采}}',
    },
    {
      key: i18next.t('建议采购'),
      value: '{{列.建议采购}}',
    },
  ],
}

const detailFields = [
  { key: i18next.t('商户名'), value: '{{商户名}}' },
  { key: i18next.t('商户编码'), value: '{{商户编码}}' },

  {
    key: i18next.t('采购数量(采购单位)'),
    value: '{{采购数量_采购单位}}{{采购单位}}',
  },

  { key: i18next.t('商品备注'), value: '{{商品备注}}' },
]

export default {
  commonFields,
  tableFields,
  detailFields,
}
