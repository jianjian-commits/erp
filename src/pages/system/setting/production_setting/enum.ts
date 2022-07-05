import { t } from 'gm-i18n'

const PLAN_PRODUCTION_DEFAULT_SETTING = [{ text: t('需求数'), value: 1 }]

const PRODUCTION_PLAN_AMOUNT = [
  { text: t('建议生产数'), value: 1 },
  { text: t('需求数'), value: 2 },
]

const PLAN_PACK_DEFAULT_SETTING = [{ text: t('需求数'), value: 1 }]

const PACK_PLAN_AMOUNT = [
  { text: t('建议包装数'), value: 1 },
  { text: t('需求数'), value: 2 },
]

const PRODUCTION_TASK_RULE = [
  {
    text: t(
      '按”工序投入物料+工序(含工序参数)+车间+客户+线路“规则，按天聚合为一条生产工单',
    ),
    className: 'span-block',
  },
  {
    text: t(
      '按客户/线路生产的根据客户或线路进行聚合展示；不按客户/线路生产的也会聚合展示；',
    ),
    className: 'gm-text-red',
  },
]

const PRODUCTION_TASK_OUTPUT_SOURCE = [
  {
    text: t(
      '1、开启后，工位屏的产出入库和生产计划页面均不支持录入产出，最后一道工序的产出将同步至计划，作为计划产出',
    ),
  },
  {
    text: t(
      '2、关闭后，工位屏的产出入库和生产计划页面均支持录入产出，最后一道工序的产出将不同步至计划',
    ),
  },
  {
    text: t('3、切换开关，将会影响计划产出数的录入方式以及展示，请谨慎切换'),
    className: 'gm-text-red',
  },
]

const PRODUCTION_TASK_OUTPUT_SOURCE_TIP = [
  {
    text: t('1、切换后，计划产出数可能会出现和最后一道工序产出数不相同的情况'),
    className: 'gm-text-red',
  },
  {
    text: t(
      '2、开启切为关闭，修改最后一道工序产出不会再影响计划的产出，可能会出现产出数记录少了的情况',
    ),
    className: 'gm-text-red',
  },
  {
    text: t(
      '3、关闭切为开启，无法在计划上录入产出，若已在计划上录入了产出，在最后一道工序录入产出时，计划的产出数将会叠加，可能会出现产出数据重复的情况',
    ),
    className: 'gm-text-red',
  },
  {
    text: t('4、请确保计划已完成且产出数将不再变动时再进行切换，谨慎切换'),
    className: 'gm-text-red',
  },
]

const PRODUCTION_COOK_YIELD = [
  {
    text: t(
      '1、开启后，单品BOM支持录入熟出成率，组合BOM支持拉取已设置熟出成率、录入熟重数量，适用于生产中组合BOM配比需根据熟重以及熟出成率计算的场景',
    ),
  },
  {
    text: t('2、关闭后，单品BOM以及组合BOM将不支持录入熟出成率以及熟重数据'),
  },
]

const PRODUCTION_MATERIAL_REPLACE = [
  {
    text: t('1、开启后，支持选择非计划原料的商品作为原料领取'),
  },
  {
    text: t('2、关闭后，不支持选择非计划原料的商品作为原料领取'),
  },
]

const PRODUCTION_BOM_REPLACE = [
  {
    text: t(
      '1、开启后，支持生产计划/包装计划中组成物料进行替换，仅对未下达、进行中计划生效',
    ),
  },
  {
    text: t('2、关闭后，不支持对生产计划/包装计划中组成物料进行替换'),
  },
]

const PRODUCTION_DOWNSTREAM_RULE_DELETE = [
  {
    text: t(
      '1、替换后，非已完成状态的原物料关联下游计划以及任务将被删除，关联的采购计划也将被同步删除',
    ),
  },
  {
    text: t('2、按替换后物料生成关联计划、任务以及采购计划'),
  },
]

const PRODCUTION_DOWNSTREAM_RULE_RESERVE = [
  {
    text: t('1、替换后，原有关联的下游计划及任务会保留'),
  },
  {
    text: t('2、按替换后物料生成关联计划、任务以及采购计划'),
  },
]

const DEFAULT_ALGORITHM_SETTING = [
  { text: t('不启用'), value: 0 },
  { text: t('启用公式“日均下单数x调整比例x预计备货天数”'), value: 1 },
]

const PRODUCTION_PLAN_NAVIGATION = [
  {
    text: t('切换导航后，生产计划的导航将根据选择的导航顺序进行相应的调整。'),
  },
]

export {
  PLAN_PRODUCTION_DEFAULT_SETTING,
  PRODUCTION_PLAN_AMOUNT,
  PLAN_PACK_DEFAULT_SETTING,
  PACK_PLAN_AMOUNT,
  PRODUCTION_TASK_RULE,
  PRODUCTION_TASK_OUTPUT_SOURCE,
  PRODUCTION_TASK_OUTPUT_SOURCE_TIP,
  PRODUCTION_COOK_YIELD,
  PRODUCTION_MATERIAL_REPLACE,
  PRODUCTION_BOM_REPLACE,
  PRODUCTION_DOWNSTREAM_RULE_DELETE,
  PRODCUTION_DOWNSTREAM_RULE_RESERVE,
  DEFAULT_ALGORITHM_SETTING,
  PRODUCTION_PLAN_NAVIGATION,
}
