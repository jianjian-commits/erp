import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('单据日期'), value: '{{单据日期}}' },
    { key: t('结款日期'), value: '{{结款日期}}' },
    { key: t('打印时间'), value: '{{当前时间}}' },
    { key: t('单据编号'), value: '{{单据编号}}' },
    { key: t('付款单摘要'), value: '{{付款单摘要}}' },
    { key: t('制单人'), value: '{{制单人}}' },
    { key: t('经办人'), value: '' },
    { key: t('自定义'), value: '' },
  ],
  [t('供应商')]: [
    { key: t('往来单位'), value: `{{往来单位}}` },
    { key: t('供应商编号'), value: `{{供应商编号}}` },
    {
      key: t('供应商营业执照号'),
      value: '{{供应商营业执照号}}',
    },
    { key: t('联系电话'), value: `{{联系电话}}` },
    { key: t('开户银行'), value: `{{开户银行}}` },
    { key: t('银行账号'), value: `{{银行账号}}` },
    { key: t('结款方式'), value: `{{结款方式}}` },
    { key: t('开户名'), value: `{{开户名}}` },
  ],
  [t('金额')]: [
    {
      key: t('单据总金额'),
      value: Price.getCurrency() + '{{单据总金额}}',
    },
    {
      key: t('折让金额'),
      value: Price.getCurrency() + '{{折让金额}}',
    },
    {
      key: t('应付金额'),
      value: Price.getCurrency() + '{{应付金额}}',
    },
    {
      key: t('已付金额'),
      value: Price.getCurrency() + '{{已付金额}}',
    },
    {
      key: t('商品总金额'),
      value: Price.getCurrency() + '{{商品总金额}}',
    },
    {
      key: t('不含税商品总金额'),
      value: Price.getCurrency() + '{{不含税商品总金额}}',
    },
    {
      key: t('税额'),
      value: Price.getCurrency() + '{{税额}}',
    },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{当前页码}}/{{页码总数}}' }],
}

const tableFields = {
  [t('单据明细')]: [
    { key: t('序号'), value: '{{列.序号}}' },
    { key: t('单据类型'), value: '{{列.单据类型}}' },
    { key: t('单据编号'), value: '{{列.单据编号}}' },
    { key: t('入库/退货金额'), value: '{{列.入库_退货金额}}' },
    { key: t('商品总金额'), value: '{{列.商品总金额}}' },
    { key: t('不含税商品总金额'), value: '{{列.不含税商品总金额}}' },
    { key: t('税额'), value: '{{列.税额}}' },
    { key: t('入库/退货时间'), value: '{{列.入库时间}}' },
    { key: t('自定义'), value: '' },
  ],
  [t('折让明细')]: [
    { key: t('折让原因'), value: '{{列.折让原因}}' },
    { key: t('折让类型'), value: '{{列.折让类型}}' },
    { key: t('折让金额'), value: '{{列.折让金额}}' },
    { key: t('备注'), value: '{{列.备注}}' },
    { key: t('自定义'), value: '' },
  ],
}

export default {
  commonFields,
  tableFields,
}
