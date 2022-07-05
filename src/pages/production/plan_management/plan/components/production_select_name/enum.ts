import { t } from 'gm-i18n'
import { BomType } from 'gm_api/src/production'

export enum Select_BOM_Type {
  product,
  pack,
  all,
}

export const Sku_Bom_Type = {
  [Select_BOM_Type.pack]: {
    value: [BomType.BOM_TYPE_PACK],
    text: t('输入包装成品名称搜索'),
  },
  [Select_BOM_Type.product]: {
    value: [BomType.BOM_TYPE_CLEANFOOD, BomType.BOM_TYPE_PRODUCE],
    text: t('输入生产成品名称搜索'),
  },
  [Select_BOM_Type.all]: {
    value: undefined,
    text: t('输入生产成品名称搜索'),
  },
}

export const List_Drop_Type = (isPack?: boolean) => {
  const text = isPack ? '包装' : '生产'
  return [
    {
      value: 1,
      text: t(`按${text}成品`),
      desc: t(`输入${text}成品名称搜索`),
      key: 'sku_name',
    },
    {
      value: 2,
      text: t('按需求编号'),
      desc: t('输入需求编号搜索'),
      key: 'serial_no',
    },
  ]
}
