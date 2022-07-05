import globalStore, { UnitSomeArray } from '@/stores/global'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  GetManySkuResponse_SkuInfo,
  GetUnitRateGroupResponse_UnitRateGroup,
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageSubSkuType,
  Sku,
  Sku_NotPackageSubSkuType,
  Sku_PackageSubSkuType,
  Sku_SkuType,
  SsuInfo,
  Unit,
  UnitValue,
} from 'gm_api/src/merchandise'
import {
  OutputType,
  ProcessTask,
  ProcessTask_Material,
  ProcessTask_Output,
  ProcessTask_TimeType,
  ProduceType,
  Task,
  TaskSource_SourceType,
  Task_TimeType,
  Task_Type,
  ProcessTask_State,
} from 'gm_api/src/production'
import _ from 'lodash'
import moment from 'moment'
import { dpProduction, PRINT_TYPE_VALUE, toFixedZero } from './enum'
import type { GetUnitType, UnitInfoParams } from './interface'
import type { TaskSku, TaskSkuInfo } from './task/interface'

const limit = (date: Date) => {
  return moment(date) > moment().endOf('day')
}

export const dateFilterData = [
  {
    type: Task_TimeType.TIME_TYPE_CREATE,
    name: t('按创建时间'),
    expand: false,
    limit,
  },
  {
    type: Task_TimeType.TIME_TYPE_DELIVERY,
    name: t('按计划交期'),
    expand: false,
  },
  {
    type: Task_TimeType.TIME_TYPE_RELEASE,
    name: t('按下达时间'),
    expand: false,
    limit,
  },
]

export const taskCommandDate = [
  {
    type: ProcessTask_TimeType.TIME_TYPE_CREATE,
    name: t('按创建时间'),
    expand: false,
  },
  {
    type: ProcessTask_TimeType.TIME_TYPE_DELIVERY,
    name: t('按任务交期'),
    expand: false,
  },
]

export const getBatchActionContent = (key: string, isPack?: boolean) => {
  let title = ''
  let context: { text: string; style?: string }[] = []
  let isRelease = false // 是否是下达计划

  switch (key) {
    case 'order_plan':
      title = t('下达计划')
      context = [
        {
          text: t('说明：'),
        },
        {
          text: t(
            '1、批量下达生产计划时，按计划生产数下达，计划状态为未下达才可下达计划；',
          ),
        },
        {
          text: t(
            `2、${
              isPack ? '包装' : '生产'
            }任务按默认规则生成，规则可在设置-生产设置中查看。`,
          ),
        },
      ]
      isRelease = true
      break
    case 'merge_plan':
      title = t('合并计划')
      context = [
        {
          text: t('生产成品、BOM一致的计划将会合并为一条计划，确定合并吗？'),
        },
        {
          text: t('合并后原计划的工序指令将会被重新合并，请谨慎操作'),
          style: 'red',
        },
      ]
      break
    case 'mark_finish':
      title = t('标记完工')
      context = [
        { text: t('是否标记计划状态为“已完成”？') },
        { text: t('计划状态为进行中才可标记完工'), style: 'red' },
      ]
      break
  }
  return { title, context, isRelease }
}

export const getBatchActionContent_Task = (state: ProcessTask_State) => {
  let title = ''
  let context = ''
  switch (state) {
    case ProcessTask_State.STATE_STARTED:
      title = t('开始任务')
      context = t(
        '任务状态为“未开工”才可以开始任务,确认后,任务状态改为“已开工”',
      )
      break
    case ProcessTask_State.STATE_FINISHED:
      title = t('标记完工')
      context = t('任务状态为进行中才可标记完工,是否标记任务状态为“已完成”？')
      break
  }
  return { title, context }
}

// 生产的计算统一用页面展示的计算，所以需要先保留四位小数再计算
export const numMultiple = (x: string, y: string) => {
  return Big(x || 0)
    .times(y || 0)
    .toFixed(dpProduction)
}

export const numMinus = (x: string, y: string) => {
  return Big(x || 0)
    .minus(y || 0)
    .toFixed(dpProduction)
}

export const numAdd = (x: string, y: string) => {
  return Big(x || 0)
    .plus(y || 0)
    .toFixed(dpProduction)
}

// 生产模块统一保留展示四位小数
export const toFixed = (b: string) => Big(b || '0').toFixed(dpProduction)

export const numDiv = (x: string, y: string) => {
  return toFixed(y) !== toFixedZero
    ? Big(x || 0)
        .div(y)
        .toFixed(dpProduction)
    : ''
}

/**
 * 获取sku单位： 只用传unit_id和units
 * 获取包装: 都必填
 * @param params
 */
export function getUnitInfo(params: UnitInfoParams): GetUnitType {
  const unitInfo = {
    unitId: params.unit_id, // 单位id
    unitName: '', // 单位名称(包装单位 / 基本单位)
    baseUnitId: '', // 基本单位id（计量单位）
    baseUnitName: '', // 基本单位名称（计量单位）
    rate: '', // 比值
    ssuName: '', // 带上当前所在的ssu_name
  }

  if (params.units) {
    const unitMapData = params.units[unitInfo.unitId]
    if (unitMapData) {
      unitInfo.unitName = unitMapData.name
      unitInfo.rate = unitMapData.rate
    }
  }

  // 包装相关
  if (params.sku_id && params.skus) {
    const skuMapData = params.skus[params.sku_id]
    if (skuMapData) {
      const ssu = skuMapData!.ssu_map![params.unit_id] // 用初始的unit_id
      if (ssu) {
        unitInfo.unitId = ssu?.ssu?.unit?.unit_id || ''
        unitInfo.unitName = ssu?.ssu?.unit?.name || ''
        unitInfo.rate = ssu?.ssu?.unit?.rate || ''
        unitInfo.ssuName = ssu?.ssu?.name || ''

        // 生成基本id
        unitInfo.baseUnitId = ssu?.ssu?.unit.parent_id!
        // 生成名称
        let unitMapData = params.units[unitInfo.baseUnitId]
        // 如果找不到，尝试从global取
        if (!unitMapData) {
          unitMapData = globalStore.getUnit(unitInfo.baseUnitId)!
        }

        if (unitMapData) {
          unitInfo.baseUnitName = unitMapData.name
        }
      }
    }
  }
  return unitInfo
}

// 获取商品类型 - 是否包材 - 具体商品类型
export const getSkuType = (
  sku_id: string,
  skus?: { [key: string]: GetManySkuResponse_SkuInfo },
) => {
  let type = ''
  if (skus) {
    if (!skus[sku_id]) return ''

    const sku: Sku = skus && skus[sku_id].sku!
    const sku_type = sku?.sku_type || Sku_SkuType.ST_UNSPECIFIED
    switch (sku_type) {
      case Sku_SkuType.PACKAGE:
        {
          const sub_type: Sku_PackageSubSkuType = sku?.package_sub_sku_type!
          type = map_Sku_PackageSubSkuType[sub_type]
        }
        break
      case Sku_SkuType.NOT_PACKAGE:
        {
          const sub_type: Sku_NotPackageSubSkuType =
            sku?.not_package_sub_sku_type!
          type = map_Sku_NotPackageSubSkuType[sub_type]
        }
        break
      case Sku_SkuType.ST_UNSPECIFIED:
        type = ''
        break
    }
  }
  return type
}

// 数量相关展示
export const renderAmountInfo = (
  amount: string,
  needUnit?: boolean,
  unit_name?: string,
) => {
  if (amount) {
    return `${toFixed(amount)}${needUnit ? unit_name : ''}`
  }

  return '-'
}

/**
 * 标记计划的产出数据
 * @param data 计划数据
 * @param isPack 是否包装计划
 * @param units
 * @param skus
 */
export const dealOutputTask = (
  data: Task[],
  isPack = false,
  units: { [key: string]: Unit },
  skus: { [key: string]: GetManySkuResponse_SkuInfo },
): TaskSkuInfo[] => {
  // 整理计划中的成品信息，便于展示
  const taskSkus: TaskSkuInfo[] = _.map(data, (t) => {
    let _skus: TaskSku[] = []
    // by_products 生产任务中是副产品的信息，包装任务中是周转物信息. 在包装任务中数量和id都是指基本单位
    _skus = _.map(t.by_products?.by_products?.slice() || [], (p) => {
      // 生产任务直接取成品的基本单位展示，包装任务需要取ssu对应的单位展示
      const unit_name: string = getUnitInfo({
        unit_id: p.unit_id!,
        units,
      }).unitName
      const current_sku = skus && skus[p.sku_id!]?.sku

      return {
        sku_id: p.sku_id || '',
        sku_name: p.sku_name || '',
        unit_id: p.unit_id,
        unit_name,
        plan_amount: isPack ? p.plan_amount : '', // 计划生产数(生产任务中展示为'-'，包装任务中后台计算好直接展示副产品的plan_amount)
        finish_amount: p.output_amount || '', // 已产出数
        output_amount: '0', // 产出数 -- 副产品默认为0
        isByProduct: true,
        sku_type: isPack
          ? current_sku?.package_sub_sku_type
          : current_sku?.not_package_sub_sku_type,
        // 包装计划相关 -- 返回的值都是包装单位,rate指 基本单位 / 包装单位
        spec: '-',
        pack_base_finish_amount: p.output_amount || '',
        pack_finish_amount: '', // 包装计划中周转物无需展示包装单位相关信息
        pack_base_output_amount:
          numMinus(p.plan_amount || '', p.output_amount || '') || '', // 包装计划中周转物产出数默认为成品的计划生产数
        pack_output_amount: '',
        pack_base_unit_name: unit_name || '', // 基本单位
        pack_unit_name: '', // 包装单位 -- 周转物没有包装单位
      }
    })

    // 生产任务直接拿成品的单位
    let sku_unit_name: string = getUnitInfo({
      unit_id: t.unit_id,
      units,
    }).unitName // 生产成品单位
    let spec = ''
    let pack_base_unit_name = '' // 产出基本单位
    let pack_unit_name = '' // 产出包装单位
    let pack_output_amount = '' // 产出包装单位数
    let pack_base_output_amount = '' // 产出基本单位数
    let pack_base_finish_amount = '' // 已产出基本单位数

    // 包装任务中的单位展示需要拿到ssu下面的规格单位, 处理好基本单位与包装单位
    if (isPack) {
      const unit = getUnitInfo({
        skus,
        units,
        unit_id: t?.unit_id,
        sku_id: t.sku_id,
      })
      spec = `${unit.rate}${unit.baseUnitName}/${unit.unitName}`
      sku_unit_name = unit.unitName
      pack_base_unit_name = unit.baseUnitName
      pack_unit_name = unit.unitName
      pack_output_amount =
        t.plan_amount !== ''
          ? numMinus(t.plan_amount || '', t.output_amount || '')
          : '' // 产出数 = 计划生产数 - 已产出数(其中计划生产数暂时不需要转成基本单位再进行计算)
      pack_base_output_amount = pack_output_amount
        ? numMultiple(pack_output_amount || '0', unit.rate!)
        : ''
      pack_base_finish_amount = t.base_unit_output_amount || ''
    }

    const _output_amount =
      t.plan_amount !== ''
        ? numMinus(t.plan_amount || '', t.output_amount || '')
        : ''

    // 第一个展示成品
    _skus.unshift({
      // 生产任务相关
      unit_id: t.unit_id || '',
      output_amount:
        parseFloat(_output_amount || '0') < 0 ? '0' : _output_amount, // 产出数， 成品默认为计划生产数 - 已产出数
      unit_name: sku_unit_name,
      finish_amount: t.output_amount || '',
      isByProduct: false,

      // 共用字段
      sku_id: t.sku_id || '',
      sku_name: t.sku_name || '',
      plan_amount: t.plan_amount,
      sku_type:
        (skus && skus[t.sku_id!]?.sku?.not_package_sub_sku_type) || undefined,

      // 包装计划相关 -- 返回的值都是包装单位,rate指 基本单位 / 包装单位, 字段中base表示基本单位，否则包装单位
      spec,
      pack_base_finish_amount,
      pack_finish_amount: t.output_amount || '',
      pack_base_output_amount:
        parseFloat(pack_base_output_amount) < 0 ? '0' : pack_base_output_amount,
      pack_output_amount:
        parseFloat(pack_output_amount) < 0 ? '0' : pack_output_amount, // 包装任务成品产出数默认等于 计划生产数 - 已产出数
      pack_base_unit_name,
      pack_unit_name,
    })

    return {
      skus: _skus,
      task_id: t.task_id,
      serial_no: t.serial_no || '',
      state: t.state!,
      original: { ...t },
    }
  })

  return taskSkus
}

/** 出成率计算 = 产出 / 用料
 *  当用料单位与产出单位不同但可以换算时，换算成产出单位再计算
 *  当用料单位与产出单位不同且不可换算时，不计算
 *
 *  用料数量  = 领料数量 - 退料数量
 */
export const finishProductRate = (
  outputs: any[],
  inputs: any[],
  unit_rates: GetUnitRateGroupResponse_UnitRateGroup[],
) => {
  // unit_rates: [{ unit_id_1(产出id), unit_id_2(物料id), rate}]
  const unitGroup = _.groupBy(unit_rates, 'unit_id_2')
  let result = '-'

  // 计算总产出, 产出只有一个，不需要判断单位是否相同
  const output_unit_id: string = outputs[0].unit_id || ''
  const outs = _.sum(
    _.map(outputs, (output) => toFixed(output.output_amount || '0')),
  )
  const _ins: string[] = []

  _.forEach(inputs, (input) => {
    const _actual_amount: string = toFixed(
      numMinus(input.receive_amount || '0', input.return_amount || '0'),
    )

    // 判断物料单位是否与产出单位相同，不同可换算时换成成成品的单位
    if (input.unit_id !== output_unit_id) {
      if (unit_rates) {
        // rate = unit_id_1 / unit_id
        const rate = (unitGroup[input.unit_id][0] || { rate: '' }).rate
        if (rate) {
          // 换算成成品单位数量
          const actual_amount = Big(_actual_amount)
            .div(rate)
            .toFixed(dpProduction)
          _ins.push(actual_amount)
        } else {
          result = '-'
        }
      }
      return false
    }
    return true
  })

  if (result === '-') {
    return result
  }

  // 计算实际用料和
  const ins = toFixed(`${_.sum(_ins)}`)
  if (ins === '' || ins === toFixedZero) return '-'
  return Big(outs).div(ins).toFixed(dpProduction)
}

/**
 * 根据系统设置展示，计划生产数 = 需求数 / 建议生产数
 * 若计划生产数 = 建议生产数 = 日均下单数 x 调整比例 x 预计备货天数
 */
export const getPlanAmount = () => {
  // 获取系统设置
  // `建议${TASK_TEXT[type]}=需求数-库存，计划完成后此数值将保持不变；若库存小于0，则建议${TASK_TEXT[type]}=需求数；若建议${TASK_TEXT[type]}数小于0，则建议${TASK_TEXT[type]}为“库存充足”`
}

export const getPrintLog = () => {
  const log: { [key: string]: number[] } = localStorage.getItem(
    'gmProductionPrintType',
  )
    ? JSON.parse(localStorage.getItem('gmProductionPrintType')!)
    : {}

  return log
}

// 打印的默认设置
export const getInitPrintType = (type: string) => {
  let check: number[] = []
  switch (type) {
    case `${Task_Type.TYPE_PRODUCE}_production`: // 生产 - 生产
      check = [
        PRINT_TYPE_VALUE.processor_production,
        PRINT_TYPE_VALUE.team_production,
      ]
      break
    case `${Task_Type.TYPE_PRODUCE}_pick`: // 生产 - 领料
      check = [PRINT_TYPE_VALUE.processor_pick, PRINT_TYPE_VALUE.work_shop_pick]
      break
    case `${Task_Type.TYPE_PACK}_pack_production`: // 包装 - 生产
      check = [
        PRINT_TYPE_VALUE.processor_pack_production,
        PRINT_TYPE_VALUE.team_pack_production,
      ]
      break
    case `${Task_Type.TYPE_PACK}_pick`: // 包装 - 领料
      check = [PRINT_TYPE_VALUE.processor_pick, PRINT_TYPE_VALUE.work_shop_pick]
      break
  }
  return check
}

export const getProcessPickMain = (
  process_task: ProcessTask,
  sku: { [key: string]: GetManySkuResponse_SkuInfo },
): SsuInfo => {
  const { sku_id, unit_id } = process_task.main_output?.material!
  return sku[sku_id!].ssu_map![unit_id!]
}

export const descTest = (isPack: boolean, name: string): string => {
  const test = isPack ? name : '基本'
  return `（${test}单位）`
}

export const headTest = (
  isPack: boolean,
  head: string,
  name: string,
): string => {
  const test = isPack ? '包装' : name
  return `${head + test}数量`
}

export const findOutPutMain = (
  outPuts: ProcessTask_Output[],
): ProcessTask_Material =>
  _.find(outPuts, {
    type: OutputType.OUTPUT_TYPE_MAIN,
  })?.material!

export const getSpec = (ssuInfo: SsuInfo): string => {
  const { name, rate, parent_id } = ssuInfo.ssu?.unit!
  return rate + globalStore.getUnitName(parent_id) + '/' + name
}

export const getSourceUnitName = (params: {
  type?: TaskSource_SourceType
  unit_id: string
  sku_id?: string
  skus?: { [key: string]: GetManySkuResponse_SkuInfo }
}) => {
  const { unit_id, sku_id, skus } = params

  return skus?.[sku_id!]?.ssu_map?.[unit_id].ssu?.unit?.name
}

/**
 *  获取getTaskTypes
 * @param type
 * @returns
 */
export const getTaskTypes = (type?: Task_Type) => {
  return type
    ? [type]
    : [Task_Type.TYPE_PRODUCE, Task_Type.TYPE_PRODUCE_CLEANFOOD]
}

// 同上
export const getProduceTypes = (type?: ProduceType) => {
  return type
    ? [type]
    : [
        ProduceType.PRODUCE_TYPE_CLEANFOOD,
        ProduceType.PRODUCE_TYPE_DELICATESSEN,
      ]
}

/** 处理生产单位组 添加rate */
export const handleUnits = (sku: Sku, unitSomeArray?: UnitSomeArray[]) => {
  const { base_unit_id, production_unit, second_base_unit_id, units } = sku
  const { unit_id: productionUnit } = production_unit!

  const handleAllUnits = ({
    unitId,
    tagText,
  }: {
    unitId: string
    tagText: string
  }) => {
    return _.find(unitSomeArray, (v) =>
      v.unitArrayId.includes(unitId!),
    )?.unitArray.map((unit) => {
      return {
        ...unit,
        value: unit.unit_id,
        text: unit.name!,
        tag: tagText,
      }
    })!
  }
  const cloneDeepData = handleAllUnits({
    unitId: base_unit_id,
    tagText: t('基本单位'),
  })

  if (+second_base_unit_id!) {
    cloneDeepData.push(
      ...handleAllUnits({
        unitId: second_base_unit_id!,
        tagText: t('辅助单位'),
      }),
    )
  }
  if (production_unit && +productionUnit! && productionUnit !== base_unit_id) {
    cloneDeepData.push(
      ...handleAllUnits({
        unitId: productionUnit!,
        tagText: t('生产单位'),
      }),
    )
  }
  cloneDeepData.push(
    ..._.map(units?.units, (unit) => ({
      ...unit,
      value: unit.unit_id,
      text: unit.name,
      tag: t('自定义单位'),
    })),
  )

  return cloneDeepData
}

/**
 * 计算成本 使用后台的rate
 * @param data  material_cost 物料成本,unit_id 当前单位,unit_ids 单位组,yieldNumber 单位数量,sClean 净菜
 * @returns
 */
export const getMaterialRateCostV2 = (data: {
  material_cost?: UnitValue | undefined
  yieldNumber?: string | number | Big | null
  isClean?: boolean
}) => {
  const { material_cost, yieldNumber, isClean } = data
  if (!material_cost || Big(yieldNumber || 0).eq(0)) return 0

  return +Big(material_cost?.val ?? 0)
    .times(isClean ? Big(1).div(Big(yieldNumber!).div(100)) : yieldNumber!)
    .toFixed(4)
}
