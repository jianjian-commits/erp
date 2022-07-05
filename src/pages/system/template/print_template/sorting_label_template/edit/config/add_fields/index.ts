import { t } from 'gm-i18n'

const addFields = {
  [t('基础')]: [
    { key: t('商品名'), value: '{{SKU}}' },
    { key: t('商品编码'), value: '{{SKU_ID}}' },
    { key: t('商品规格编码'), value: '{{商品规格编码}}' },
    { key: t('下单数（下单单位）'), value: '{{下单数_下单单位}}' },
    { key: t('实称数（下单单位）'), value: '{{实称数_下单单位}}' },
    { key: t('单价'), value: '{{单价}}' },
    { key: t('单价（下单单位）'), value: '{{单价_下单单位}}' },
    { key: t('商品备注'), value: '{{商品备注}}' },
    { key: t('订单备注'), value: '{{订单备注}}' },
    { key: t('分拣员名字'), value: '{{分拣员名字}}' },
    { key: t('打印时间'), value: '{{当前时间_年月日}}' },
    { key: t('订单号'), value: '{{订单号}}' },
    { key: t('分拣号'), value: '{{分拣号}}' },
  ],
  [t('配送')]: [
    { key: t('商户名'), value: '{{商户名}}' },
    { key: t('商户编码'), value: '{{商户编码}}' },
    { key: t('线路'), value: '{{线路}}' },
    { key: t('司机'), value: '{{司机}}' },
    { key: t('收货日期'), value: '{{收货日期}}' },
  ],
  [t('其他')]: [{ key: t('页码'), value: '{{页码}}' }],
}

export default addFields
