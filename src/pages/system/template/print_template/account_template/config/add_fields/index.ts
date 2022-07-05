/** value 不要加多语言,加者GG🔥🚸 */
import globalStore from '@/stores/global'
import { Price } from '@gm-pc/react'
import { i18next } from 'gm-i18n'

const commonFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('公司信息'), value: '{{公司信息}}' },
    { key: i18next.t('公司编码'), value: '{{公司编码}}' },
    { key: i18next.t('登陆账号'), value: '{{登陆账号}}' },
    { key: i18next.t('联系人'), value: '{{联系人}}' },
    { key: i18next.t('联系电话'), value: '{{联系电话}}' },
    { key: i18next.t('账期'), value: '{{账期}}' },
    { key: i18next.t('打印时间'), value: '{{打印时间}}' },
  ],
  [i18next.t('金额')]: [
    { key: i18next.t('下单金额'), value: '{{下单金额}}' },
    { key: i18next.t('出库金额'), value: '{{出库金额}}' },
    { key: i18next.t('销售金额'), value: '{{销售金额}}' },
  ],
}

const tableFields = {
  [i18next.t('基础')]: [
    { key: i18next.t('序号'), value: '{{列.序号}}' },
    { key: i18next.t('商品名'), value: '{{列.商品名}}' },
    { key: i18next.t('类别'), value: '{{列.类别}}' },
    // { key: i18next.t('规格'), value: '{{列.规格}}' },
    { key: i18next.t('明细'), value: '{{列.明细}}' },
    { key: i18next.t('计量单位'), value: '{{列.计量单位}}' },
    { key: i18next.t('包装单位'), value: '{{列.包装单位}}' },
    { key: i18next.t('自定义'), value: '' },
  ],
  [i18next.t('数量')]: [
    {
      key: i18next.t('下单数'),
      value: '{{列.下单数}}{{列.下单单位}}',
    },
    !globalStore.isLite && {
      key: i18next.t('出库数'),
      value: globalStore.isLite
        ? '{{列.出库数}}{{列.出库单位}}'
        : '{{列.出库数}}{{列.出库单位}} {{列.辅助单位出库数}}{{列.辅助出库单位}}',
    },
    !globalStore.isLite && {
      key: i18next.t('多单位数量'),
      value: '{{列.多单位数量}}',
    },
    // {
    //   key: i18next.t('出库数(计量单位)'),
    //   value: '{{列.出库数_计量单位}}',
    // },
    // {
    //   key: i18next.t('出库数(包装单位)'),
    //   value: '{{列.出库数_包装单位}}',
    // },
  ],
  [i18next.t('金额')]: [
    // { key: i18next.t('单价(计量单位)'), value: '{{列.单价_计量单位}}' },
    // { key: i18next.t('单价(包装单位)'), value: '{{列.单价_包装单位}}' },
    {
      key: i18next.t('单价'),
      value: `{{列.单价}}${Price.getUnit()}/{{列.定价单位}}`,
    },
    { key: i18next.t('出库金额'), value: '{{列.出库金额}}' },
  ],
}

export default {
  commonFields,
  tableFields,
}
