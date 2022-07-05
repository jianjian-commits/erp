import { UnitGlobal } from '@/stores/global'
import { TreeListItem } from '@gm-pc/react'
import Big from 'big.js'
import { Customer } from 'gm_api/src/enterprise'
import {
  Attr,
  BomType,
  Bom_Process,
  Bom_Process_Input,
  Bom_Process_Material_Property,
  Bom_Process_Output,
  Bom_Process_Type,
  OutputType,
  ProcessTemplate,
} from 'gm_api/src/production'
import _ from 'lodash'
import { BomDetail, MaterialItem, ProcessOfBom } from './interface'
import store from './store'

/**
 * 工序模板
 * @extends {Omit<Bom_Process & Bom_Process_Input & Bom_Process_Output, 'type' | 'inputs' | 'outputs'>}
 */
interface ProcessTemp
  extends Omit<
    Bom_Process & Bom_Process_Input & Bom_Process_Output,
    'type' | 'inputs' | 'outputs'
  > {
  /** 商品ID */
  sku_id?: string
  /** 单位ID */
  unit_id?: string
  /** 单位名 */
  unit_name?: string
  /** 数量 */
  quantity?: string
  property?: number
  /** 产出数量 */
  output_quantity?: number
  /** 投料数量 */
  input_quantity?: number
  /** 工序种类 */
  type?: Bom_Process_Type
}

type BomProcess = Omit<ProcessOfBom, 'customized_code'>

/** ！！！bom里面工序的排序规则: 组合工序从100开始递增表示，普通工序从1开始递增表示，以当前修改bom的工序顺序为准 */

/**
 * 把客户列表转换至树形
 * @param  {Customer[]}                  list 客户列表
 * @return {(Customer & TreeListItem)[]}      树形结构的客户列表
 */
const convertCustomerListToTree = (list: Customer[]) => {
  const group = _.groupBy(list, 'parent_id')
  // parent_id为0可认为是kid
  const customers = group['0']
  const customer_tree: (Customer & TreeListItem)[] = _.map(
    customers,
    (customer) => ({
      ...customer,
      leaves: _.map(group[customer.customer_id] || [], (c) => ({
        ...c,
        value: customer.customer_id,
        text: customer.name || '',
      })),
      value: customer.customer_id,
      text: customer.name || '',
    }),
  )
  return customer_tree
}

/**
 * 添加工序， 需要判断工序是否被删除
 * @param {BomProcess[]}     processes   所有工序
 * @param {ProcessTemp}      new_process 工序模板
 * @param {Bom_Process_Type} type        工序种类
 */
const _addProcess = (
  processes: BomProcess[],
  new_process: ProcessTemp,
  type: Bom_Process_Type,
) => {
  const is_clean = store.bomDetail.type === BomType.BOM_TYPE_CLEANFOOD
  const {
    attrs,
    type: newProcessType,
    process_template_id,
    process_id,
    rank,
    input_quantity,
    output_quantity,
    cook_yield_rate,
  } = new_process
  // 如果当前工序所选择的参数已经被删除，无需展示，直接清除掉
  const current_process: ProcessTemplate = _.find(
    store.processList.slice(),
    (p) => p.process_template_id === process_template_id!,
  ) as ProcessTemplate

  const new_attrs: Attr[] = _.filter(attrs || [], (attr) => {
    return (
      _.findIndex(
        current_process?.attrs?.attrs || [],
        (a) => a.attr_id === attr.attr_id,
      ) !== -1
    )
  })
  // 增加判断，如果工序类型相同才加入
  if (newProcessType === type) {
    processes.push({
      process_id: process_id || '',
      process_template_id: process_template_id || '',
      attrs: new_attrs,
      type,
      rank: rank || 0,
      process_yield: is_clean
        ? cook_yield_rate
          ? +cook_yield_rate
          : +Big(output_quantity!).div(input_quantity!).times(100).toFixed(2) ||
            0
        : undefined,
      // 单品 => 1.计算出成率. 2.兼容老数据,新结构不需要前端计算
    })
  }
}

/**
 * 递归找到工序
 * process_id在bom里面唯一, 按照数组顺序即为工序顺序
 * @param  {BomProcess[]}     processes 所有工序
 * @param  {ProcessTemp}      current   当前工序模板
 * @param  {ProcessTemp[]}    inputs    投料的工序模板
 * @param  {ProcessTemp[]}    outputs   产出的工序模板
 * @param  {Bom_Process_Type} type      工序种类
 * @return {BomProcess[]}               更新后的所有工序
 */
const _recursiveFindProcess = (
  processes: BomProcess[],
  current: ProcessTemp,
  inputs: ProcessTemp[],
  outputs: ProcessTemp[],
  type: Bom_Process_Type,
) => {
  // 起始工序，要先加入
  if (
    current.prev_process_id === '0' &&
    (current?.type !== Bom_Process_Type.TYPE_COMBINED ||
      (current?.rank || 0) < 100)
  ) {
    // 只适用于普通工序，组合工序另做处理
    _addProcess(processes, current, type)
  }

  // 找到当前的下一个工序，拿到next_process_id，目前只有最后一道工序有多个产物
  const next = _.filter(
    outputs,
    (output) =>
      output.sku_id === current.sku_id &&
      output.process_id === current.process_id,
  )

  // 判断是否中止查找，否则返回工序列表, length > 1说明到了最后一道工序
  if (next.length === 1) {
    const next_process_id = next[0].next_process_id
    // 在input中找到下一个工序，拿到输入信息
    const next_process = _.filter(
      inputs,
      (input) => input.process_id === next_process_id,
    )

    // length > 1说明是组合工序
    if (next_process.length === 1) {
      _addProcess(processes, next_process[0], type)

      _recursiveFindProcess(processes, next_process[0], inputs, outputs, type)
    }
  }

  return processes
}

/**
 * 铺平信息用, 由于单品BOM涉及相关出成率的计算，所以带上每一道工序的理论投入产出数量
 * @param  {Bom_Process[]} list BOM工序列表
 * @return {any}                投料工序和产出工序
 */
const flattenProcesses = (list: Bom_Process[]) => {
  // 单品BOM不会出现组合工序, 都是单输入单输出
  const inputs: ProcessTemp[] = _.flatten(
    _.map(list.slice(), (item) => {
      const input_len = item.inputs.length
      return _.map(item.inputs, (input, index: number) => ({
        ...input,
        process_id: item.process_id,
        process_template_id: item.process_template_id,
        attrs: item.attrs?.slice(),
        rank: item.rank,
        type: item.type,
        input_quantity:
          input_len > 1 ? 100 : parseFloat(input.material?.quantity || '0'),
        output_quantity:
          input_len > 1
            ? 100
            : parseFloat(item?.outputs[index]!.material?.quantity || '0'),
      }))
    }),
  )
  // 只用来查询，不需要带上数量
  const outputs: ProcessTemp[] = _.flatten(
    _.map(list.slice(), (item) => {
      return _.map(item.outputs, (output) => ({
        ...output,
        process_id: item.process_id,
        process_template_id: item.process_template_id,
        attrs: item.attrs?.slice(),
        rank: item.rank,
        type: item.type,
      }))
    }),
  )
  return { inputs, outputs }
}

/**
 * 获取工序原料
 * @param  {any} p 工序信息
 * @return {any}   工序原料
 */
const getProcessMaterial = (p: any) => {
  return {
    sku_id: p?.material?.sku_id || '',
    unit_id: p?.material?.unit_id,
    quantity: p?.material?.quantity,
    property: p?.material?.property,
    base_unit_id: '',
    cook_yield_rate: p.cook_yield_rate,
    cooked_quantity: p.cooked_quantity,
  }
}

/**
 * 获取原料列表
 * @param {Bom_Process[]} list 工序列表
 */
// sku A1 -> 1 -> 2 -> 4
// sku A2 -> 3 -> 4
const getMaterialList = (list: Bom_Process[]) => {
  // 数据铺平放在inputs / outputs里面
  const { inputs, outputs } = flattenProcesses(list)
  // 找到起始物料, 需要把组合工序剔除掉, prev_process_id为0，说明是物料 / 组合工序的第一道工序
  const startProcesses = _.filter(
    _.filter(inputs, (input) => input.prev_process_id === '0'),
    (i) =>
      _.findIndex(
        list,
        (item) =>
          item?.inputs?.length === 1 && item.process_id === i?.process_id,
      ) !== -1,
  )
  // 根据next_process_id找到下一个工序
  const material_list: MaterialItem[] = _.map(startProcesses, (p) => {
    const processes: ProcessOfBom[] = []
    _recursiveFindProcess(
      processes,
      p,
      inputs,
      outputs,
      Bom_Process_Type.TYPE_NORMAL,
    )
    // 表格展示需要的数据
    return {
      ...getProcessMaterial(p),
      // 暂时默认为null
      process_yield: null,
      processes,
      material_cost: p.material_cost,
    }
  })
  // 存在多个物料时，如果是没有设置工序的物料，bom详情中该物料的商品信息在第一道组合工序的inputs数据中, 所以这里要校验下第一道组合工序的输入数据
  const first_combine_process = _.find(list, (item) => item.inputs!.length > 1)
  if (first_combine_process) {
    _.forEach(first_combine_process.inputs, (v) => {
      const hadSku =
        _.findIndex(material_list, (m) => m.sku_id === v.material?.sku_id) !==
        -1
      if (!hadSku) {
        material_list.push({
          ...getProcessMaterial(v),
          // 暂时默认为null
          process_yield: null,
          processes: [],
          material_cost: v.material_cost,
          materialRateCost: 0,
        })
      }
    })
  }
  // processes为单品的工序数据
  return {
    material_list,
    processes: material_list[0].processes,
  }
}

/**
 * 获取组合工序
 * @param  {Bom_Process]}   list   BOM工序列表
 * @param  {boolean}        isPack 是否是包装BOM
 * @return {ProcessOfBom[]}        BOM组合工序
 */
const getCombineProcess = (
  list: Bom_Process[],
  isPack?: boolean,
): ProcessOfBom[] => {
  // inputs.length > 1, 说明是组合工序.找到当前多个输入的组合工序，并且这是第一个组合工序
  const combineProcess = isPack
    ? list[0]
    : _.find(list, (item: Bom_Process) =>
        item?.rank !== undefined && item?.type !== undefined
          ? item?.rank === 100 && item?.type === Bom_Process_Type.TYPE_COMBINED
          : (item.inputs || []).length > 1,
      )

  // 数据铺平放在inputs / outputs里面
  const { inputs, outputs } = flattenProcesses(list)
  const p = _.find(
    inputs,
    (input) => input.process_id === combineProcess?.process_id,
  ) || { process_id: '', process_template_id: '', attrs: [], rank: 0 }

  const processes: ProcessOfBom[] = []
  _recursiveFindProcess(
    processes,
    p,
    inputs,
    outputs,
    Bom_Process_Type.TYPE_COMBINED,
  )
  const has_process = _.find(
    processes,
    (pro) => pro.process_id === p.process_id,
  )
  if (p.process_id && !has_process) {
    // 加入第一个工序
    processes.unshift({
      process_id: p.process_id || '',
      process_template_id: p.process_template_id || '',
      attrs: p.attrs || [],
      type: Bom_Process_Type.TYPE_COMBINED,
      rank: p.rank || 0,
    })
  }
  return processes
}

/**
 * 获取原料信息
 * @param  {MaterialItem} material   原料
 * @param  {string}       [quantity] 数量
 * @return {any}                     原料信息
 */
const getMaterial = (material: MaterialItem, quantity?: string) => {
  return {
    sku_id: material.sku_id,
    unit_id: material.unit_id || '',
    quantity: quantity ?? material.quantity,
    property: Bom_Process_Material_Property.PROPERTY_INTERMEDIATE, // 表示中间物
  }
}

/**
 * 获取所有工序
 * @param  {BomDetail}      bomDetail      BOM详情
 * @param  {MaterialItem[]} materialList   BOM原料列表
 * @param  {ProcessOfBom[]} bomProcessList BOM工序列表
 * @return {Bom_Process[]}                 所有工序
 */
const getAllProcesses = (
  bomDetail: BomDetail,
  materialList: MaterialItem[],
  bomProcessList: ProcessOfBom[],
) => {
  let allProcesses: Bom_Process[] = []
  const { by_products, selectedSku, type, base_unit_id, quantity } = bomDetail
  const sku_id = selectedSku?.value!
  const isOnlyOneMaterial = type === BomType.BOM_TYPE_CLEANFOOD
  // 处理工序信息 -- 物料工序 + 组合工序，组合工序第一道输入加入所有物料，副产品加入最后一道工序的输出

  // 通过type来判断是组合还是物料  单品为物料 包装和组合为组合工序
  const materials = _.filter(
    materialList,
    (m) => m.sku_id !== '' && !m.isFinishedProduct,
  )

  const process = _.filter(bomProcessList, (m) => m.process_template_id !== '')
  let processIndex = 0

  // 处理副产品,output类型没有包含中间产物
  const by_pros = _.map(by_products, (p) => ({
    material: {
      sku_id: p.sku_id,
      unit_id: p.base_unit_id || '', // 副产品用自己的单位id
      quantity,
      property: Bom_Process_Material_Property.PROPERTY_INTERMEDIATE, // 表示中间物
    },
    type: OutputType.OUTPUT_TYPE_EXTRA, // 表示产出类型 -- 副产品
  }))
  // 单品工序
  if (isOnlyOneMaterial) {
    _.forEach(materials, (material) => {
      const { cooked_quantity } = material
      const list = _.map(process, (p) => ({
        process_id: p.process_id,
        process_template_id: p.process_template_id,
        type: Bom_Process_Type.TYPE_NORMAL,
        rank: processIndex++,
        inputs: [
          {
            material: getMaterial(material, '' + p.input_quantity),
            cooked_quantity,
            cook_yield_rate: '' + p.process_yield,
          },
        ],
        outputs: [
          {
            material: getMaterial(material, '' + p.output_quantity),
            // 产出类型设置为该工序的主成品
            type: OutputType.OUTPUT_TYPE_MAIN,
          },
        ],
        attrs: _.map(p.attrs, (attr) => ({
          attr_id: attr.attr_id,
          // 详情时直接保存在value中
          val: attr.values ? attr.values[0] || attr.val : attr.val || '',
        })),
      }))
      allProcesses = allProcesses.concat(list)
    })
    const len: number = allProcesses.length || 1
    // 最后道工序输出成品和副产品
    if (allProcesses[len - 1] && allProcesses[0]?.outputs?.length) {
      const main_pro = _.find(
        allProcesses[len - 1]?.outputs,
        (o) => o.type === OutputType.OUTPUT_TYPE_MAIN,
      )
      if (main_pro) {
        main_pro.material = {
          sku_id,
          unit_id: base_unit_id || '',
          quantity,
          property: Bom_Process_Material_Property.PROPERTY_PRODUCT, // 表示成品
        }
      }
      allProcesses[len - 1].outputs = [
        ...allProcesses[len - 1]?.outputs,
        ...by_pros,
      ]
    }
  }
  // 组合工序
  if (!isOnlyOneMaterial) {
    let combineProcessIndex = 100
    // 处理组合工序信息
    const combines: Bom_Process[] = _.map(process, (p, pIndex) => {
      // 成品信息
      const _output = [
        {
          material: {
            sku_id,
            unit_id: base_unit_id || '',
            quantity,
            property: Bom_Process_Material_Property.PROPERTY_PRODUCT, // 表示中间物
          },
          type: OutputType.OUTPUT_TYPE_MAIN,
        },
      ]

      return {
        process_id: p.process_id,
        process_template_id: p.process_template_id,
        type: Bom_Process_Type.TYPE_COMBINED,
        rank: combineProcessIndex++,
        inputs:
          // 第一道组合工序输入需要加入所有物料
          pIndex === 0
            ? _.map(materials, (material) => ({
                material: {
                  ...getMaterial(material),
                  property: Bom_Process_Material_Property.PROPERTY_INTERMEDIATE,
                },
                cook_yield_rate: material.cook_yield_rate,
                cooked_quantity: material.cooked_quantity,
              }))
            : [
                {
                  material: {
                    sku_id,
                    unit_id: bomDetail.base_unit_id || '',
                    quantity,
                    property:
                      Bom_Process_Material_Property.PROPERTY_INTERMEDIATE, // 表示中间物
                  },
                },
              ],
        outputs:
          // 最后一道工序的outputs需要加入主产品，副产品信息
          pIndex === process.length - 1 ? [..._output, ...by_pros] : _output,
        attrs: _.map(p.attrs, (attr) => ({
          attr_id: attr.attr_id,
          // 详情时直接保存在value中
          val: attr.values ? attr.values[0] || attr.val : attr.val || '',
        })),
      }
    })

    allProcesses = allProcesses.concat(combines)
  }
  return allProcesses
}

/**
 * 改变百分数
 * @param  {ProcessOfBom[]} processes BOM的工序信息
 * @return {string}                   改变后的百分数
 */
const percentageChange = (processes: ProcessOfBom[]) =>
  (
    _.reduce(
      _.filter(processes, (v) => !!v.process_template_id!),
      (total, { process_yield }) =>
        +Big(total)
          .times(process_yield! || 0)
          .div(100),
      1,
    ) * 100
  ).toFixed(2)

/**
 * 修改工序中的出成率
 * 在物料中修改出成率,工序中添加删除时重新赋值工序的出成率
 * @param  {ProcessOfBom[] | Omit<ProcessOfBom, 'customized_code'>[]} processes 工序列表
 * @param  {number}                                                   sku_yield 物料出成率
 * @return {ProcessOfBom[] | Omit<ProcessOfBom, 'customized_code'>[]}           修改后的工序
 */
const processYieldChange = (
  processes: ProcessOfBom[] | Omit<ProcessOfBom, 'customized_code'>[],
  sku_yield: number,
): ProcessOfBom[] | Omit<ProcessOfBom, 'customized_code'>[] =>
  _.map(processes, ({ process_yield, ...another }, i) => ({
    ...another,
    process_yield: +i === processes.length - 1 ? sku_yield : 100,
  }))

/**
 * 切换状态
 * @param  {boolean} state  当前状态是否开启
 * @param  {string}  status 状态
 * @param  {number}  value  新的状态的值
 * @return {string}         切换后的状态
 */
const switchStatus = (
  state: boolean,
  status: string,
  value: number,
): string => {
  return '' + (+status + (state ? value : -value))
}

/**
 * 利用二进制的&来判断是否包含某种状态
 * @param  {string}  status 当前状态
 * @param  {string}  value  校验的值
 * @return {boolean}        校验的结果
 */
const withStatus = (status: string, value: number): boolean => {
  return Boolean(+status & value)
}

/**
 * 数量转换单位
 * @param  {string}       quantity     当前数量
 * @param  {string}       unitId       当前单位
 * @param  {string}       targetUnitId 目标单位
 * @param  {UnitGlobal[]} unitIds      所有单位
 * @return {string}                    转化单位后的数量
 */
const changeRate = (
  quantity: string,
  unitId: string,
  targetUnitId: string,
  unitIds: UnitGlobal[],
): string => {
  const nowUnitRate = _.find(unitIds, { value: unitId })?.rate!
  const targetUnitRate = _.find(unitIds, { value: targetUnitId })?.rate!

  return Big(quantity).times(Big(nowUnitRate).div(targetUnitRate)).toString()
}

export {
  convertCustomerListToTree,
  getMaterialList,
  getCombineProcess,
  getAllProcesses,
  percentageChange,
  processYieldChange,
  switchStatus,
  withStatus,
  changeRate,
}
