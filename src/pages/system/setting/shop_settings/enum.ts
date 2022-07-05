import { t } from 'gm-i18n'

const Merchandise_Combine_TIP = [
  {
    text: t(
      '关闭后，组合商品修改后，若菜谱中已添加了该商品，将仅更新组合商品名称，物料和配比将不会同步更新；',
    ),
    className: 'gm-margin-bottom-5',
  },
  {
    text: t(
      '开启后，组合商品修改后，若菜谱中已添加了该商品，将同步更新组合商品名称、物料以及配比。',
    ),
  },
]

const Merchandise_Pack_TIP = [
  {
    text: t('1、开启后，包材将计入成本计算，此设置仅影响包装BOM成本计算'),
  },
  {
    text: t('2、关闭后，包材不计入成本计算，此设置仅影响包装BOM成本计算'),
  },
]

const Merchandise_Quotation_TIP = [
  {
    text: t('开启后，创建报价单需要经过审批才能生效'),
  },
]

const Merchandise_Formula_TIP = [
  {
    text: t('可设置商品价格再经过定价公式计算后的精确度'),
  },
]

export {
  Merchandise_Combine_TIP,
  Merchandise_Pack_TIP,
  Merchandise_Quotation_TIP,
  Merchandise_Formula_TIP,
}
