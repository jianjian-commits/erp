import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('商户数'), value: '{{商户数}}' },
    { key: t('报价时间'), value: '{{当前时间}}' },
    { key: t('商品数'), value: '{{商品数}}' },
    // todo
    { key: t('定价周期'), value: '{{定价周期}}' },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{当前页码}}/{{页码总数}}' }],
}

const tableFields = {
  [t('基础')]: [
    { key: t('序号'), value: '{{列.序号}}' },
    { key: t('商品名称'), value: '{{列.商品名称}}' },
    { key: t('商品分类'), value: '{{列.商品分类}}' },
    {
      key: t('下单单位'),
      value: t('{{列.下单单位}}'),
    },
    { key: t('商品单价'), value: '{{列.商品单价}}' },
    { key: t('描述'), value: '{{列.描述}}' },
    {
      key: t('最近报价'),
      value: '{{列.最近报价}}',
      toolTip: t(
        '周期报价单商品最近报价取自上一期，普通报价单商品最近报价取自最近一次报价',
      ),
    },
  ],
}

const combineTableFields = [
  { key: t('序号'), value: t('{{列.序号}}') },
  { key: t('商品名称'), value: t('{{列.商品名称}}') },
  {
    key: t('商品分类'),
    value: t('{{列.商品分类}}'),
  },
  {
    key: t('下单单位'),
    value: t('{{列.下单单位}}'),
  },
  { key: t('商品单价'), value: t('{{列.商品单价}}') },
  { key: t('下单数量'), value: t('{{列.下单数量}}') },
  { key: t('描述'), value: t('{{列.描述}}') },
]

export default {
  commonFields,
  tableFields,
  combineTableFields,
}
