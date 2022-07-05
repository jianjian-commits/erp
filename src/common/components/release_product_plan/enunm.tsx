import { t } from 'gm-i18n'
import { ProductionPlanTimeType, ProductionPlanOrderType } from './interface'

export const ProductionPlanTime: ProductionPlanTimeType[] = [
  {
    head: t('单品'),
    name: 'production_cleanfood_type',
    timeName: 'production_cleanfood_time',
    batchName: 'production_cleanfood_batch',
  },
  {
    head: t('组合'),
    name: 'production_type',
    timeName: 'production_time',
    batchName: 'production_batch',
  },
  {
    head: t('包装'),
    name: 'pack_type',
    timeName: 'pack_time',
    batchName: 'pack_batch',
  },
]

export const ProductionPlanOrder: ProductionPlanOrderType[] = [
  {
    head: t('单品'),
    orderName: 'production_cleanfood_order',
    batchName: 'production_cleanfood_batch',
  },
  {
    head: t('组合'),
    orderName: 'productio_order',
    batchName: 'production_batch',
  },
  {
    head: t('包装'),
    orderName: 'pack_order',
    batchName: 'pack_batch',
  },
]
