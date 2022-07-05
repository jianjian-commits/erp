import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('打印时间'), value: '{{当前时间}}' },
    { key: i18next.t('采购经办'), value: '{{采购员}}' },
    { key: i18next.t('采购单位'), value: '{{采购单位}}' },
    { key: i18next.t('供应商'), value: '{{供应商}}' },
    { key: i18next.t('供应商编号'), value: '{{供应商编号}}' },
    // { key: i18next.t('采购金额'), value: '{{采购金额}}' },
    { key: i18next.t('任务数'), value: '{{任务数}}' },
    { key: i18next.t('采购员电话'), value: '{{采购员电话}}' },
    { key: i18next.t('供应商电话'), value: '{{供应商电话}}' },
    { key: i18next.t('采购单据号'), value: '{{采购单据号}}' },
    { key: i18next.t('单据备注'), value: '{{单据备注}}' },
    { key: i18next.t('创建人'), value: '{{创建人}}' },
    { key: i18next.t('预计到货时间'), value: '{{预计到货时间}}' },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('采购金额'), value: '{{采购金额}}' },
    { key: i18next.t('不含税采购金额'), value: '{{不含税采购金额}}' },
    { key: i18next.t('税额'), value: '{{税额}}' },
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
    { key: i18next.t('采购备注'), value: '{{列.采购备注}}' },
    { key: i18next.t('商品编码'), value: '{{列.商品编码}}' },
    { key: i18next.t('供应商协作模式'), value: '{{列.供应商协作模式}}' },
    { key: i18next.t('商品等级'), value: '{{列.商品等级}}' },
  ],
  [i18next.t('数量')]: [
    {
      key: i18next.t('采购数量(采购单位)'),
      value: '{{列.采购数量_采购单位}}{{列.采购单位}}',
    },

    {
      key: i18next.t('预计到货数(采购单位)'),
      value: '{{列.预计到货数_采购单位}}{{列.采购单位}}',
    },
  ],
  [i18next.t('价格')]: [
    {
      key: i18next.t('采购单价(采购单位)'),
      value: '{{列.单价_采购单位}}{{列.采购单位}}',
    },

    {
      key: i18next.t('不含税采购单价(采购单位)'),
      value: '{{列.不含税单价_采购单位}}{{列.采购单位}}',
    },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('采购金额'), value: '{{列.采购金额}}' },
    { key: i18next.t('不含税采购金额'), value: '{{列.不含税采购金额}}' },
    { key: i18next.t('税额'), value: '{{列.税额}}' },
    { key: i18next.t('税率'), value: '{{列.税率}}' },
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
