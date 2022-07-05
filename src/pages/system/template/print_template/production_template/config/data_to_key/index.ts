import moment from 'moment'
import _ from 'lodash'
import globalStore from '@/stores/global'
import {
  ListTaskProductSheetByProcessorResponseSheet,
  ProcessTaskCommands,
  ProcessTaskCommandExpand,
} from '@/pages/system/template/print_template/production_template/interface'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import Big from 'big.js'
import {
  getPlanAmount,
  getOutAmount,
  getProduction,
  cleanFoodYield,
} from './util'
import { toFixed } from '@/pages/production/util'
import {
  PRINT_COMMAND_VAlUE,
  PrintCommandType,
} from '@/pages/production/task_command/enum'

const taskItem = (
  task: ProcessTaskCommandExpand,
  index: number,
  j?: number,
) => {
  const {
    processTaskInfo,
    materialName,
    materialSku,
    finishProductSku,
    finishProductName,
    ssuInfo,
    production_unit,
    attrInfoArray,
    isCommand,
    bomInfo,
    taskInfo,
    process_task_command_id,
    processYield,
    isNoCommandOrLastProcess,
  } = task

  const processName = `[${processTaskInfo.process_task?.process_name}]`
  const processAttar = _.map(
    processTaskInfo.process_task?.attrs?.attrs,
    ({ name, val }) => `${name}(${val})`,
  ).join(',')
  // 成品需求与产出
  const { amount: planAmount, value: planValue } = getPlanAmount(task)
  const { amount: outAmount, value: outValue } = getOutAmount(task)
  // 包装相关
  const { name, rate, parent_id } = ssuInfo?.ssu?.unit ?? {}
  const parentName = globalStore.getUnitName(parent_id!)
  return {
    // 基础
    序号: index + 1,
    index: j,
    自定义: '',
    // 成品
    生产成品编码: isNoCommandOrLastProcess
      ? finishProductSku?.customize_code
      : '-',
    生产成品: finishProductName,
    商品类型: isNoCommandOrLastProcess
      ? map_Sku_NotPackageSubSkuType?.[
          finishProductSku?.not_package_sub_sku_type!
        ]
      : '-',
    需求数_基本单位: isNoCommandOrLastProcess
      ? toFixed(
          _.reduce(
            taskInfo,
            (all, next) => all.add(next.order_amount),
            Big(0),
          ).toString(),
        ) + globalStore.getUnitName(taskInfo![0].base_unit_id!)
      : '-',
    计划生产_基本单位: isNoCommandOrLastProcess ? outValue : '-',
    成品出成率: isNoCommandOrLastProcess
      ? cleanFoodYield(bomInfo?.processes?.processes ?? [])
      : '-', // 根据bom取值
    // 物料
    物料编码: materialSku?.customize_code,
    物料名称: materialName,
    理论用料数量_基本单位: planValue,
    理论用料数量_生产单位: +production_unit?.unit_id!
      ? getProduction(planAmount, production_unit!)
      : planValue,
    理论产出数量_基本单位: outValue,
    // 工序
    组合工序: isCommand ? processName : '-',
    物料工序: !isCommand ? processName : '-',
    工序参数: processAttar,
    组合工序_工序参数: isCommand ? processName + processAttar : '-',
    物料工序_工序参数: !isCommand ? processName + processAttar : '-',
    工序出成率: processYield,
    // 包装
    理论包装数量_基本单位: isNoCommandOrLastProcess
      ? toFixed('' + Big(outAmount).times(rate! || 1)) + parentName
      : '-',
    理论包装数量_包装单位: isNoCommandOrLastProcess
      ? toFixed(outAmount) + name
      : '-',
    指导配料: attrInfoArray?.length ? attrInfoArray.join(',') : '-',
    process_task_command_id: isCommand ? process_task_command_id : undefined,
  }
}

/**
 * 表格基础数据
 * @param process_task_commands
 */

function normalTable(process_task_commands: ProcessTaskCommands[]) {
  return _.map(process_task_commands, (task, i) => {
    if (_.isArray(task)) {
      return _.map(task as ProcessTaskCommandExpand[], (item, j) => {
        return taskItem(item, +i, j)
      })
    } else {
      return taskItem(task as ProcessTaskCommandExpand, +i)
    }
  })
}

function getRelevanceMessage(
  process_task_commands: ProcessTaskCommands[],
  type: 'relevanceRoutes' | 'relevanceCustomers',
): string | undefined {
  let nameList: string[] = []
  _.forEach(process_task_commands, (commands) => {
    Array.isArray(commands)
      ? _.map(
          commands,
          (command) => (nameList = [...nameList, ...command[type]!]),
        )
      : (nameList = [...nameList, ...commands[type]!])
    nameList = _.uniq(nameList)

    if (nameList.length === 3) {
      nameList.splice(1, 2, nameList[1] + '...')
      return false
    }
  })
  return nameList.length ? nameList.join('，') : '-'
}

// 整理单据的数据
function clearFoodDataKey(
  data: ListTaskProductSheetByProcessorResponseSheet,
  printCommandType: PRINT_COMMAND_VAlUE,
  isEdit?: string | undefined,
) {
  const {
    process_task_commands,
    early_delivery_time,
    last_delivery_time,
    processorName,
  } = data
  const common = {
    打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    单据日期_日期: moment().format('YYYY-MM-DD'),
    单据日期_时间: moment().format('HH:mm:ss'),
    打印时间_日期: moment().format('YYYY-MM-DD'),
    打印时间_时间: moment().format('HH:mm:ss'),
    最早任务交期: moment(new Date(+early_delivery_time!)).format(
      'YYYY-MM-DD HH:mm',
    ),
    最晚任务交期: moment(new Date(+last_delivery_time!)).format(
      'YYYY-MM-DD HH:mm',
    ),
    关联客户: getRelevanceMessage(process_task_commands!, 'relevanceCustomers'),
    关联线路: getRelevanceMessage(process_task_commands!, 'relevanceRoutes'),
    自定义: '',
    车间or小组:
      isEdit ||
      (printCommandType === PRINT_COMMAND_VAlUE.material_production
        ? PrintCommandType[printCommandType]
        : processorName) ||
      PrintCommandType[printCommandType],
  }
  // 获取表格数据
  let tableData = normalTable(process_task_commands!)
  // 修改表格数据
  tableData = _.map(tableData, (item) => {
    // 判断数据类型
    if (_.isArray(item)) {
      const processTaskCommandIdArr = _.values(
        _.groupBy(item, 'process_task_command_id'),
      )
      // 遍历数组，将数组的第一项rowSpan为true，剩余的项为false
      const processTaskCommandIdArrRow = _.map(
        processTaskCommandIdArr,
        (item) => {
          return _.map(item, (item, i) => {
            if (item.process_task_command_id) {
              return i === 0
                ? { ...item, rowSpan: true }
                : { ...item, rowSpan: false }
            }
            return item
          })
        },
      )
      // 将修改完的数据，插入原本的数据
      _.forEach(processTaskCommandIdArrRow, (item1) => {
        item.splice(item1[0].index!, item1.length, ...item1)
      })
      return item
    }
    return item
  })

  return {
    common,
    _table: {
      orders: tableData, // 物料
      '1': tableData, // 物料
      '2': tableData, // 生产
      '3': tableData, // 工序
      '4': tableData, // 包装
      // orders_multi: generateTable(details || [], 'multi'), // 双栏
    },
    _origin: data,
  }
}

export default clearFoodDataKey
