import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('单据'), value: '{{单据}}' },
    { key: t('入库时间'), value: '{{入库时间}}' },
    { key: t('单据编号'), value: '{{单据编号}}' },
    { key: t('建单时间'), value: '{{建单时间}}' },
    { key: t('供应商名称'), value: '{{供应商名称}}' },
    { key: t('供应商编号'), value: '{{供应商编号}}' },
    { key: t('单据备注'), value: '{{单据备注}}' },
    { key: t('单据状态'), value: '{{单据状态}}' },
    { key: t('支付状态'), value: '{{支付状态}}' },
    { key: t('打印时间'), value: '{{当前时间}}' },
    { key: t('打单人'), value: '{{打单人}}' },
    { key: t('建单人'), value: '{{建单人}}' },
    { key: t('预计到货时间'), value: '{{预计到货时间}}' },
  ],
  [t('金额')]: [
    {
      key: t('入库金额'),
      value: `${Price.getCurrency()}{{入库金额}}`,
    },
    {
      key: t('商品金额'),
      value: `${Price.getCurrency()}{{商品金额}}`,
    },
    {
      key: t('折让金额'),
      value: `${Price.getCurrency()}{{折让金额}}`,
    },
    {
      key: t('不含税金额'),
      value: `${Price.getCurrency()}{{不含税金额}}`,
    },
    {
      key: t('税额'),
      value: `${Price.getCurrency()}{{税额}}`,
    },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{当前页码}} / {{页码总数}}' }],
}

const tableFields = {
  [t('基础')]: [
    { key: t('序号'), value: '{{列.序号}}' },
    { key: t('批次号'), value: '{{列.批次号}}' },
    { key: t('商品自定义编码'), value: '{{列.商品自定义编码}}' },
    { key: t('商品名称'), value: '{{列.商品名称}}' },
    // { key: t('规格自定义编码'), value: '{{列.规格自定义编码}}' },
    // { key: t('规格名称'), value: '{{列.规格名称}}' },
    // { key: t('包装规格'), value: '{{列.包装规格}}' },
    { key: t('商品分类'), value: '{{列.商品分类}}' },
    { key: t('生产日期'), value: '{{列.生产日期}}' },
    { key: t('存放货位'), value: '{{列.存放货位}}' },
    { key: t('生产计划'), value: '{{列.生产计划}}' },
    { key: t('生产对象'), value: '{{列.生产对象}}' },
    { key: t('操作人'), value: '{{列.操作人}}' },
    { key: t('自定义'), value: '{{列.自定义}}' },
  ],
  [t('单位')]: [
    {
      key: t('基本单位'),
      value: '{{列.基本单位}}',
    },
    // {
    //   key: t('包装单位'),
    //   value: '{{列.包装单位}}',
    // },
  ],
  [t('数量')]: [
    {
      key: t('入库数(基本单位)'),
      value: '{{列.入库数_基本单位}}',
    },
    // {
    //   key: t('入库数(包装单位)'),
    //   value: '{{列.入库数_包装单位}}',
    // },
  ],
  [t('金额')]: [
    {
      key: t('入库单价(基本单位)'),
      value: '{{列.入库单价_基本单位}}',
    },
    {
      key: t('补差'),
      value: '{{列.补差}}',
    },
    { key: t('入库金额'), value: '{{列.入库金额}}' },
    { key: t('不含税单价'), value: '{{列.不含税单价}}' },
    { key: t('不含税金额'), value: '{{列.不含税金额}}' },
    { key: t('税额'), value: '{{列.税额}}' },
    { key: t('税率'), value: '{{列.税率}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
