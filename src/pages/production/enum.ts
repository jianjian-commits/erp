import { t } from 'gm-i18n'
import {
  TaskSource_SourceType,
  Task_Operation,
  Task_Type,
} from 'gm_api/src/production'
import type { ObjectOfKey, TypeText } from './interface'

// 生产模块小数点定义
export const dpProduction = 4
export const toFixedZero = '0.0000'

// 列表文本搜索
export const listSearchType = [
  {
    value: 1,
    text: t('按生产成品'),
    desc: t('输入生产成品名称搜索'),
    key: 'sku_name',
  },
  {
    value: 2,
    text: t('按计划编号'),
    desc: t('输入计划编号搜索'),
    key: 'serial_no',
  },
]

export const TASK_COMMAND_SELECT_TYPE = {
  outPut: 1,
  inPut: 2,
  serialNo: 3,
}

export const taskCommandSearchType = [
  {
    value: TASK_COMMAND_SELECT_TYPE.outPut,
    text: t('按生产成品'),
    desc: t('输入生产成品名称搜索'),
    key: 'sku_name',
  },
  {
    value: TASK_COMMAND_SELECT_TYPE.inPut,
    text: t('按物料名称'),
    desc: t('输入物料名称搜索'),
    key: 'process_name',
  },
  {
    value: TASK_COMMAND_SELECT_TYPE.serialNo,
    text: t('按任务编号'),
    desc: t('输入任务编号搜索'),
    key: 'serial_no',
  },
]

export const SELECT_NAME = {
  isProductOut: 1,
  isPack: 2,
  isSSu: 3,
}

export const MODULE_TYPE = {
  default: 0,
  customer: 1,
  router: 2,
}

export const ModuleType = [
  {
    text: t('默认'),
    value: MODULE_TYPE.default,
  },
  {
    text: t('按客户生产'),
    value: MODULE_TYPE.customer,
  },
  {
    text: t('按线路生产'),
    value: MODULE_TYPE.router,
  },
]

export const cellHeight = 45

// 批量操作
export const BATCH_OPERATION_MAP: ObjectOfKey<Task_Operation> = {
  order_plan: Task_Operation.OPERATION_RELEASE,
  merge_plan: Task_Operation.OPERATION_MERGE,
  mark_finish: Task_Operation.OPERATION_FINISH,
  delete: Task_Operation.OPERATION_DELETE,
}

// 方便统一，直接先定义各种打印单据的value值，后续只需要修改这里即可
export const PRINT_TYPE_VALUE = {
  // 生产 - 生产单
  production: 1,
  processes_production: 2,
  processor_production: 3,
  work_shop_production: 4,
  team_production: 5,

  // 包装 -生产单
  pack_production: 6,
  processor_pack_production: 7,
  work_shop_pack_production: 8,
  team_pack_production: 9,

  // 领料单
  pick: 10,
  processor_pick: 11,
  work_shop_pick: 12,
  team_pick: 13,
}

// 定义打印工厂模型，1为小组，2为车间
export const PROCESSOR_TEAM = 1
export const PROCESSOR_WORK_SHOP = 2

// 为判断打印的单据工厂模型用
export const printProcessorType = {
  team: [
    PRINT_TYPE_VALUE.team_production,
    PRINT_TYPE_VALUE.team_pack_production,
    PRINT_TYPE_VALUE.team_pick,
  ],
  work_shop: [
    PRINT_TYPE_VALUE.work_shop_production,
    PRINT_TYPE_VALUE.work_shop_pack_production,
    PRINT_TYPE_VALUE.work_shop_pick,
  ],
}

export const sourceType: {
  [key in TaskSource_SourceType]?: {
    type: keyof TypeText
    text: string
  }
} = {
  [TaskSource_SourceType.SOURCETYPE_ORDER]: {
    type: 'isOrder',
    text: '关联订单',
  },
  [TaskSource_SourceType.SOURCETYPE_PACK]: {
    type: 'isPack',
    text: '关联包装需求',
  },
  [TaskSource_SourceType.SOURCETYPE_PLAN_PACK]: {
    type: 'isPlanPack',
    text: '关联预生产',
  },
  [TaskSource_SourceType.SOURCETYPE_PLAN_PRODUCTION]: {
    type: 'isPlanProduct',
    text: '关联预生产',
  },
  [TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD]: {
    type: 'isProduct',
    text: '关联生产需求',
  },
  [TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN]: {
    type: 'isProduct',
    text: '关联生产需求',
  },
}

export const MaterialListTypeTip = {
  0: t('1、分类领料单：按相同一级商品分类所需领取的原料信息生成多张领料单；'),
  1: t('2、商品领料单：按计划所需领取的原料信息生成一张领料单；'),
  2: t('3、车间领料单：按车间所需领取的原料信息生成一张领料单；'),
  3: t('4、小组领料单：按小组所需领取的原料信息生成一张领料单。'),
}

export const Task_Produce_Type_Enum = [
  {
    value: Task_Type.TYPE_UNSPECIFIED,
    text: t('全部BOM类型'),
  },
  { value: Task_Type.TYPE_PRODUCE_CLEANFOOD, text: t('单品BOM') },
  { value: Task_Type.TYPE_PRODUCE, text: t('组合BOM') },
]

export const Task_Produce_Type_All_Enum = [
  ...Task_Produce_Type_Enum,
  { value: Task_Type.TYPE_PACK, text: t('包装BOM') },
]
