/** value 不要加多语言,加者GG🔥🚸 */
import globalStore from '@/stores/global'
import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'

const commonFields = {
  [t('基础')]: [
    { key: t('下单时间'), value: '{{下单时间}}' },
    { key: t('打印时间'), value: '{{当前时间}}' },
    { key: t('订单号'), value: '{{订单号}}' },
    { key: t('分拣序号'), value: '{{分拣序号}}' },
    !globalStore.isLite && {
      key: t('订单备注'),
      value: '{{订单备注}}',
    },
    { key: t('支付状态'), value: '{{支付状态}}' },
    !globalStore.isLite && { key: t('餐次'), value: '{{餐次}}' },
    { key: t('制单人'), value: '{{制单人}}' },
    { key: t('自定义'), value: '' },
  ].filter(Boolean),
  [t('配送')]: [
    {
      key: t('收货商户'),
      value: '{{收货商户}}({{商户ID}})',
    },
    { key: t('商户自定义编码'), value: '{{商户自定义编码}}' },
    { key: t('收货人'), value: '{{收货人}}' },
    { key: t('收货人电话'), value: '{{收货人电话}}' },
    { key: t('收货地址'), value: '{{收货地址}}' },
    { key: t('收货时间'), value: '{{收货时间}}' },
    { key: t('司机名称'), value: '{{司机名称}}' },
    { key: t('司机电话'), value: '{{司机电话}}' },
    { key: t('车牌号码'), value: '{{车牌号码}}' },
    { key: t('路线'), value: '{{路线}}' },
  ],
  [t('金额')]: [
    { key: t('下单金额'), value: '{{下单金额}}' },
    // { key: t('优惠金额'), value: '{{优惠金额}}' },
    !globalStore.isLite && {
      key: t('出库金额'),
      value: '{{出库金额}}',
    },
    { key: t('运费'), value: '{{运费}}' },
    { key: t('售后金额'), value: '{{售后金额}}' },
    { key: t('销售金额'), value: '{{销售金额}}' },
    { key: t('商品销售额'), value: '{{商品销售额}}' },
    !globalStore.isLite && {
      key: t('不含税商品销售额'),
      value: '{{不含税商品销售额}}',
    },
    !globalStore.isLite && { key: t('税额'), value: '{{税额}}' },
  ].filter(Boolean),
  [t('其他')]: [
    { key: t('页码'), value: '{{当前页码}} / {{页码总数}}' },
    { key: t('客户签名'), value: '{{客户签名}}', type: 'image' },
    { key: t('司机签名'), value: '{{司机签名}}', type: 'image' },
  ],
}

const tableFields = {
  [t('基础')]: [
    { key: t('序号'), value: '{{列.序号}}' },
    // { key: t('规格'), value: '{{列.规格}}' },
    { key: t('单位'), value: '{{列.下单单位}}' },
    { key: t('下单单位'), value: '{{列.下单单位}}' },
    { key: t('商品名'), value: '{{列.商品名}}' },
    { key: t('商品类型'), value: '{{列.商品类型}}' },
    { key: t('商品自定义编码'), value: '{{列.商品自定义编码}}' },
    { key: t('商品描述'), value: '{{列.商品描述}}' },
    { key: t('类别'), value: '{{列.类别}}' },
    { key: t('商品二级分类'), value: '{{列.商品二级分类}}' },
    !globalStore.isLite && { key: t('品类'), value: '{{列.品类}}' },
    { key: t('备注'), value: '{{列.备注}}' },
    { key: t('自定义'), value: '' },
  ].filter(Boolean),
  [t('价格')]: [
    {
      key: t('单价'),
      value: `{{列.单价}}${Price.getUnit()}/{{列.定价单位}}`,
    },
    {
      key: t('单价(不含税)'),
      value: `{{列.不含税单价}}${Price.getUnit()}/{{列.定价单位}}`,
    },
    // !globalStore.isLite && {
    //   key: t('单价(包装单位)'),
    //   value: '{{列.单价_包装单位}}',
    // },
    // !globalStore.isLite && {
    //   key: t('不含税单价(计量单位)'),
    //   value: '{{列.不含税单价_计量单位}}',
    // },
    // !globalStore.isLite && {
    //   key: t('不含税单价(包装单位)'),
    //   value: '{{列.不含税单价_包装单位}}',
    // },
  ].filter(Boolean),
  [t('数量')]: [
    {
      key: t('下单数'),
      value: '{{列.下单数}}{{列.下单单位}}',
    },
    {
      key: t('出库数'),
      value: globalStore.isLite
        ? '{{列.出库数}}{{列.出库单位}}'
        : '{{列.出库数}}{{列.出库单位}} {{列.辅助单位出库数}}{{列.辅助出库单位}}',
      //   value: '{{列.出库数}}{{列.出库单位}}',
    },
    !globalStore.isLite && {
      key: t('多单位数量'),
      value: '{{列.多单位数量}}',
    },
    // !globalStore.isLite && {
    //   key: t('下单数(包装单位)'),
    //   value: '{{列.下单数}}{{列.包装单位}}',
    // },
    // !globalStore.isLite && {
    //   key: t('出库数(包装单位)'),
    //   value: '{{列.出库数_包装单位}}',
    // },
    // !globalStore.isLite && {
    //   key: t('出库数(计量单位)'),
    //   value: '{{列.出库数_计量单位}}',
    // },
  ].filter(Boolean),
  [t('金额')]: [
    { key: t('下单金额'), value: '{{列.下单金额}}' },
    { key: t('售后金额'), value: '{{列.售后金额}}' },
    !globalStore.isLite && {
      key: t('出库金额'),
      value: '{{列.出库金额}}',
    },
    // { key: t('手动调整金额'), value: '{{列.手动调整金额}}' },
    // { key: t('销售金额'), value: '{{列.销售金额}}' },
    { key: t('商品销售额'), value: '{{列.商品销售额}}' },
    !globalStore.isLite && {
      key: t('不含税商品销售额'),
      value: '{{列.不含税商品销售额}}',
    },
    !globalStore.isLite && { key: t('税额'), value: '{{列.税额}}' },
    !globalStore.isLite && { key: t('税率'), value: '{{列.税率}}' },
  ].filter(Boolean),
}

/** 套账相关字段（通过权限控制、轻巧版不展示） */
const fakeOrderFields = {
  [t('套账')]: [
    { key: t('加单数1'), value: '{{列.加单数1}}' },
    { key: t('加单金额1'), value: '{{列.加单金额1}}' },
    { key: t('加单数2'), value: '{{列.加单数2}}' },
    { key: t('加单金额2'), value: '{{列.加单金额2}}' },
    { key: t('加单数3'), value: '{{列.加单数3}}' },
    { key: t('加单金额3'), value: '{{列.加单金额3}}' },
    { key: t('加单数4'), value: '{{列.加单数4}}' },
    { key: t('加单金额4'), value: '{{列.加单金额4}}' },
    { key: t('总加单数'), value: '{{列.总加单数}}' },
    { key: t('总加单金额'), value: '{{列.总加单金额}}' },
    { key: t('套账下单总数'), value: '{{列.套账下单总数}}' },
    { key: t('套账出库总数'), value: '{{列.套账出库总数}}' },
    { key: t('套账下单金额'), value: '{{列.套账下单金额}}' },
    { key: t('套账出库金额'), value: '{{列.套账出库金额}}' },
  ],
}

const summaryFields = [
  { key: t('下单金额'), value: '{{列.下单金额}}' },
  { key: t('售后金额'), value: '{{列.售后金额}}' },
  !globalStore.isLite && {
    key: t('出库金额'),
    value: '{{列.出库金额}}',
  },
  // {
  //   key: t('销售金额'),
  //   value: '{{列.销售金额}}',
  // },
].filter(Boolean)
const totalSummaryFields = [
  { key: t('下单金额'), value: '{{列.下单金额}}' },
  { key: t('售后金额'), value: '{{列.售后金额}}' },
  { key: t('出库金额'), value: '{{列.出库金额}}' },
]
export { fakeOrderFields }
export default {
  commonFields,
  tableFields,
  summaryFields,
  totalSummaryFields,
}
