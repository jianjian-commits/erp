import { t } from 'gm-i18n'
import { MergeType } from '@/pages/system/template/print_template/production_template/interface'
import { ProduceType, TaskProcess_Material } from 'gm_api/src/production'
import { PrintingTemplate_TemplateProductionType } from 'gm_api/src/preference'

/**
 * 计划两种单位取一个值 plan_amount
 * 实际两种单位取不同值 actual_amount/base_unit_actual_amount
 * */
export enum AMOUT_TYPE {
  plan = 1, // 计划数量
  actual, // 实际数量（生产下的基本单位 包装下的包装单位）
  baseUnitActual, // 实际数量
}

export const amountTypeToMaterial: {
  [key in AMOUT_TYPE]: keyof TaskProcess_Material
} = {
  [AMOUT_TYPE.plan]: 'plan_amount', // 计划数量
  [AMOUT_TYPE.actual]: 'actual_amount', // 实际数量（生产下的基本单位 包装下的包装单位）
  // 实际数量
  [AMOUT_TYPE.baseUnitActual]: 'base_unit_actual_amount', // 实际数量
}

export const SHOW_OVERFLOW = {
  attrs: 1, // 参数
  raw_input: 2, // 配料
  output: 3, // 物料
  input: 4, // 成品
}

// 打印类型level参数
export enum PRINT_COMMAND_VAlUE {
  team_production = 1,
  car_production = 2,
  material_production = 3,
}

export const PrintCommandType: Record<string, string> = {
  [PRINT_COMMAND_VAlUE.team_production]: t('小组生产单'),
  [PRINT_COMMAND_VAlUE.material_production]: t('物料生产单'),
  [PRINT_COMMAND_VAlUE.car_production]: t('车间生产单'),
}

// 打印类型数组
export const printTypeArray = [
  {
    value: PRINT_COMMAND_VAlUE.material_production,
    title: t('物料生产单'),
    tip: t('多个物料一张单'),
  },
  {
    value: PRINT_COMMAND_VAlUE.car_production,
    title: t('车间生产单'),
    tip: t('一个车间一张单'),
  },
  {
    value: PRINT_COMMAND_VAlUE.team_production,
    title: t('小组生产单'),
    tip: t('一个小组一张单'),
  },
]

// 聚合方式数组
export const mergeTypeArray = [
  {
    value: MergeType.TYPE_PROCESS,
    title: t('按工序聚合打印'),
    tip: t('适用于按工序生产'),
    showType: [
      PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD,
      PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN,
    ],
  },
  {
    value: MergeType.TYPE_MATERIAL,
    title: t('按物料聚合打印'),
    tip: t('适用于按物料生产'),
    showType: [PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD],
  },
  {
    value: MergeType.TYPE_FINISH_PRODUCT,
    title: t('按生产成品聚合打印'),
    tip: t('适用于按物料生产'),
    showType: [
      PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN,
    ],
  },
]

export const TRANSFORM_PRODUCT_PRINT_TYPE: {
  [key in ProduceType]: PrintingTemplate_TemplateProductionType
} = {
  [ProduceType.PRODUCE_TYPE_UNSPECIFIED]:
    PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_UNSPECIFIED,
  [ProduceType.PRODUCE_TYPE_CLEANFOOD]:
    PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD,
  [ProduceType.PRODUCE_TYPE_DELICATESSEN]:
    PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN,
  [ProduceType.PRODUCE_TYPE_PACK]:
    PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_PACK,
}

// 打印类型level参数
// 层级1小组，2车间
export enum PRINT_PICK_ENUM {
  group = 1,
  car,
  merchandise,
  sort,
}

// 打印领料单
export const printPickArray = [
  {
    value: PRINT_PICK_ENUM.merchandise,
    title: t('商品领料单'),
    tip: t('按照商品打印领料单'),
  },
  {
    value: PRINT_PICK_ENUM.sort,
    title: t('分类领料单'),
    tip: t('按照商品分类打印领料单，一个商品分类一个领料单'),
  },
  {
    value: PRINT_PICK_ENUM.car,
    title: t('车间领料单'),
    tip: t('仅打印车间需要领取的原料信息，一个车间一张领料单'),
  },
  {
    value: PRINT_PICK_ENUM.group,
    title: t('小组领料单'),
    tip: t(
      '仅打印小组需要领取的原料信息，一个小组一张领料单，若该小组无需领取原料则不会被打印出来',
    ),
  },
]
