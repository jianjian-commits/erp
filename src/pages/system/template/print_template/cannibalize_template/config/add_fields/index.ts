import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('移库单号'), value: '{{移库单号}}' },
    { key: t('单据状态'), value: '{{单据状态}}' },
    { key: t('建单时间'), value: '{{建单时间}}' },
    { key: t('建单人'), value: '{{建单人}}' },
    { key: t('备注'), value: '{{备注}}' },
  ],
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
    { key: t('移出货位'), value: '{{列.移出货位}}' },
    { key: t('入库日期'), value: '{{列.入库日期}}' },
    { key: t('保质期'), value: '{{列.保质期}}' },
    { key: t('移入货位'), value: '{{列.移入货位}}' },
    { key: t('供应商'), value: '{{列.供应商}}' },
    { key: t('自定义'), value: '{{列.自定义}}' },
  ],
  [t('数量')]: [
    {
      key: t('账面库存(基本单位)'),
      value: '{{列.账面库存_基本单位}}',
    },
    // {
    //   key: t('账面库存(包装单位)'),
    //   value: '{{列.账面库存_包装单位}}',
    // },
    {
      key: t('移库数(基本单位)'),
      value: '{{列.移库数_基本单位}}',
    },
    // {
    //   key: t('移库数(包装单位)'),
    //   value: '{{列.移库数_包装单位}}',
    // },
  ],
}

export default {
  commonFields,
  tableFields,
}
