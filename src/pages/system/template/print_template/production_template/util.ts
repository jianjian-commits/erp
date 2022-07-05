import {
  ListTaskProductSheetByProcessorResponse,
  ProcessTaskCommand,
  ProcessTaskDetail,
  ProcessTaskRelation,
  ProcessTask_Input,
  ProcessTask_Output,
  ProduceType,
} from 'gm_api/src/production'
import Big from 'big.js'
import _ from 'lodash'
import { toFixed } from '@/common/util'
import { findOutPutMain } from '@/pages/production/util'
import {
  ProcessTaskCommandExpand,
  TaskInputExpand,
  ListTaskProductSheetByProcessorResponseSheet,
  MergeType,
  ProcessTaskCommands,
  groupByType,
  TemplateConfig,
  ProcessTaskCommandMerge,
  SignProcessTaskType,
} from '@/pages/system/template/print_template/production_template/interface'
import globalStore, { UnitSomeArray } from '@/stores/global'
import { t } from 'gm-i18n'

// 判断关联的计划是否都为同一个生产成品 若是返回所有的taskID用于计算需求数
const mapTaskId = (processTaskRelation: ProcessTaskRelation[]) => {
  const data = _.reduce(
    processTaskRelation,
    (all, item) => {
      const { output_sku_id, task_id } = item
      all[output_sku_id!] = [...(all?.[output_sku_id!] || []), task_id!]
      return all
    },
    {} as { [key: string]: string[] },
  )
  const dataKey = Object.keys(data)
  return dataKey.length >= 2 ? [] : data[dataKey[0]]
}

// 聚合
const mergeData = (
  process_task_commands: ProcessTaskCommand[],
  process_task_details: { [key: string]: ProcessTaskDetail },
): ProcessTaskCommandMerge[] => {
  const usSheet = _.groupBy(process_task_commands, 'new_sign')
  // 需要对main_output,inputs数据进行处理
  const usArray = _.map(usSheet, (sheets) => {
    if (sheets.length === 1) {
      const { target_customer_id, target_route_id, ...sheetOther } = sheets[0]
      return {
        ...sheetOther,
        isSign: false,
        target_customer_ids: !Big(target_customer_id!).eq(0)
          ? [target_customer_id!]
          : [],
        target_route_ids: !Big(target_route_id!).eq(0)
          ? [target_route_id!]
          : [],
        taskIdS: mapTaskId(
          process_task_details[sheetOther.process_task_id!]
            .process_task_relations!,
        ),
      }
    }

    // 需要聚合的多task以第一个为模板进行相加
    const {
      inputs,
      main_output,
      target_customer_id,
      target_route_id,
      ...sheetOther
    } = sheets[0]

    const inputAmount = (
      value: 'plan_amount' | 'actual_amount',
      sku_id: string,
    ): number => {
      return +_.reduce(
        sheets,
        (all, next) =>
          Big(all).add(
            toFixed(
              +_.find(
                next!.inputs?.inputs,
                ({ material }) => material?.sku_id === sku_id,
              )?.material?.[value]! || 0,
            ),
          ),
        Big(0),
      )
    }

    const mainAmount = (value: 'plan_amount' | 'actual_amount'): number => {
      return +_.reduce(
        sheets,
        (all, next) => Big(all).add(next!.main_output?.material![value]! || 0),
        Big(0),
      )
    }

    // 聚合后的其他相关信息叠加
    const signProcessTask = _.reduce(
      sheets,
      (all, next) => {
        const { target_customer_id, target_route_id, process_task_id } = next
        const { target_customer_ids, target_route_ids, taskIdS } = all
        return {
          target_customer_ids: !Big(target_customer_id!).eq(0)
            ? target_customer_ids!.concat(target_customer_id!)
            : target_customer_ids,
          target_route_ids: !Big(target_route_id!).eq(0)
            ? target_route_ids!.concat(target_route_id!)
            : target_route_ids,
          taskIdS: taskIdS?.concat(
            mapTaskId(
              process_task_details[process_task_id!].process_task_relations!,
            ),
          ),
        }
      },
      {
        target_customer_ids: [],
        target_route_ids: [],
        taskIdS: [],
      } as SignProcessTaskType,
    )

    return {
      ...sheetOther,
      inputs: {
        inputs: _.map(inputs?.inputs, ({ material, ...other }) => {
          return {
            material: {
              ...material,
              plan_amount: '' + inputAmount('plan_amount', material?.sku_id!),
              actual_amount:
                '' + inputAmount('actual_amount', material?.sku_id!),
            },
            ...other,
          }
        }),
      },
      main_output: {
        ...main_output,
        material: {
          ...main_output?.material,
          plan_amount: '' + mainAmount('plan_amount'),
          actual_amount: '' + mainAmount('actual_amount'),
        },
      },
      target_customer_ids: signProcessTask.target_customer_ids,
      target_route_ids: signProcessTask.target_route_ids,
      taskIdS: signProcessTask.taskIdS,
      isSign: true,
    }
  })
  return usArray
}

// 以物料为最小颗粒度
const splitProcessTaskCommand = (
  processTaskCommand: ProcessTaskCommandExpand[],
) => {
  return _.reduce(
    processTaskCommand,
    (all, { inputs, relevanceCustomers, relevanceRoutes, ...nowOther }) => {
      const data = _.map(
        inputs.inputs,
        ({ materialName, materialSku, production_unit, ...other }, index) => ({
          ...nowOther,
          relevanceCustomers: index === 0 ? relevanceCustomers : [],
          relevanceRoutes: index === 0 ? relevanceRoutes : [],
          inputs: { inputs: [other] },
          materialName,
          materialSku,
          production_unit,
        }),
      )
      return [...all, ...data]
    },
    [] as ProcessTaskCommandExpand[],
  )
}

/** 工序出成率 */
const getUnitData = (
  inputData: TaskInputExpand,
  mainOutPut: ProcessTask_Output,
  unitSomeArray: UnitSomeArray[],
) => {
  const { material: inputMaterial, production_unit } = inputData
  const { material: mainMaterial } = mainOutPut
  const inputUnitArray = _.find(unitSomeArray, ({ unitArrayId }) =>
    unitArrayId.includes(inputMaterial?.base_unit_id!),
  )
  const outPutUnitArray = _.find(unitSomeArray, ({ unitArrayId }) =>
    unitArrayId.includes(mainMaterial?.base_unit_id!),
  )
  const mainOutRate =
    outPutUnitArray?.unitMap[mainMaterial?.base_unit_id!].rate!
  // 需要对物料进行换算,包含生产单位的换算
  let inputRate = +inputUnitArray?.unitMap[inputMaterial?.base_unit_id!].rate!
  let number = +inputMaterial?.plan_amount!

  // 如果不是统一单位组,则走生产单位转换。先转成统一单位组的数量和rate
  if (inputUnitArray?.parentId !== outPutUnitArray?.parentId) {
    number = +Big(number).times(production_unit?.rate!)
    inputRate = +outPutUnitArray?.unitMap[production_unit?.unit_id!]?.rate!
  }
  return (
    +Big(mainMaterial?.plan_amount!)
      .div(Big(number).times(Big(inputRate).div(mainOutRate)))
      .times(100)
      .toFixed(2) + '%'
  )
}

/**
 *
 * @param produceType 单据类型
 * @param tasks 生产返回的数据
 */
export const productionBasicsData = (
  produceType: ProduceType,
  tasks: ListTaskProductSheetByProcessorResponse,
): ListTaskProductSheetByProcessorResponseSheet[] => {
  const {
    processors,
    sheets,
    skus,
    process_task_details,
    customers,
    routes,
    boms_info,
    tasks_info,
  } = tasks
  const data = globalStore.getSameUnitArray()
  const sheetsExpand = _.map(sheets, ({ process_task_commands, ...other }) => ({
    process_task_commands: _.map(
      mergeData(
        process_task_commands! as ProcessTaskCommand[],
        process_task_details!,
      ),
      ({
        process_task_id,
        processor,
        inputs,
        isSign,
        taskIdS,
        ...commandOther
      }) => {
        const processTaskInfo = process_task_details![process_task_id!]
        const finishProductSkuId = commandOther.main_output!.material?.sku_id!
        const finishProductSku = skus![finishProductSkuId].sku
        // 非多生产成品的情况下并且为最后一道工序或为包装任务的时候 =》展示成品分类的信息
        const isNoCommandOrLastProcess =
          mapTaskId(processTaskInfo.process_task_relations!).length &&
          (commandOther.type === ProduceType.PRODUCE_TYPE_PACK ||
            commandOther.input_sku_id !==
              commandOther.main_output?.material?.sku_id)
        // 是否多物料
        const isCommand = inputs!.inputs!.length >= 2
        // 用于获取包装的规格
        const packMaterial =
          produceType === ProduceType.PRODUCE_TYPE_PACK
            ? findOutPutMain(commandOther.outputs?.outputs!)
            : undefined
        const ssuInfo =
          skus![packMaterial?.sku_id!]?.ssu_map![packMaterial?.unit_id!]
        // 多物料的情况下按bom的顺序重新排列数据
        const rawInputs = isCommand
          ? _.reduce(
              process_task_details?.[process_task_id!].process_task?.raw_inputs
                ?.inputs,
              (all, now) => {
                return [
                  ...all,
                  _.find(
                    inputs!.inputs,
                    ({ material }) => material?.sku_id === now.material?.sku_id,
                  ) as ProcessTask_Input,
                ]
              },
              [] as ProcessTask_Input[],
            )
          : inputs?.inputs
        const inputData = _.map(rawInputs, (value) => {
          const materialSku = skus![value.material?.sku_id!].sku!
          return {
            ...value,
            material: value.material,
            materialSku,
            materialName: materialSku.name, // 物料名称
            production_unit: materialSku.production_unit,
          }
        })
        return {
          inputs: {
            inputs: inputData,
          },
          relevanceCustomers: _.map(
            commandOther.target_customer_ids,
            (v) => customers![v!]?.name,
          ),
          relevanceRoutes: _.map(
            commandOther.target_route_ids,
            (v) => routes![v!]?.route_name,
          ),
          processTaskInfo,
          // 成品相关
          finishProductSku,
          finishProductSkuId,
          finishProductName: isNoCommandOrLastProcess
            ? finishProductSku?.name
            : '-',
          // 包装相关
          ssuInfo,
          ssuName: ssuInfo?.ssu?.name,
          attrInfoArray: _.map(
            processTaskInfo!.process_task!.raw_inputs!.inputs,
            ({ material }) => {
              const { sku_id, quantity, unit_id } = material!
              return (
                skus![sku_id].sku?.name +
                quantity +
                globalStore.getUnitName(unit_id)
              )
            },
          ),
          isCommand,
          taskInfo: _.map(_.uniq(taskIdS), (v) => tasks_info![v]),
          processName: processTaskInfo.process_task?.process_name,
          processYield:
            produceType === ProduceType.PRODUCE_TYPE_CLEANFOOD
              ? getUnitData(inputData[0], commandOther.main_output!, data)
              : '-',
          isNoCommandOrLastProcess,
          // 只在净菜下会获取
          bomInfo:
            boms_info?.[processTaskInfo.process_task_relations?.[0].bom_id!],
          ...commandOther,
        }
      },
    ) as ProcessTaskCommandExpand[],
    ...other,
  }))
  return _.map(sheetsExpand, (item) => {
    return {
      ...item,
      // 拆分成单物料的数据,添加一些物理信息
      process_task_commands: splitProcessTaskCommand(
        item.process_task_commands,
      ),
      processorName: processors![item.processor_id!]?.name,
    }
  })
}

/**
 * 聚合
 * @param data sheets数组
 * @param mergeType 聚合类型 物料input_sku_id 工序process_template_id
 */
export const processMerge = (
  data: ListTaskProductSheetByProcessorResponseSheet,
  mergeType: MergeType,
  isClean?: boolean,
) => {
  const { process_task_commands, ...other } = data
  // 排序
  const type = isClean ? 'materialName' : 'finishProductName'
  const sortTaskCommands = (
    process_task_commands as ProcessTaskCommandExpand[]
  ).sort((be, af) => be[type]!?.localeCompare(af[type]!, 'zh'))

  // 根据选项聚合
  const list = _.map(
    Object.values(_.groupBy(sortTaskCommands, groupByType[mergeType])),
    (item) => {
      if (item.length === 1) {
        return item[0]
      }
      return item
    },
  ) as ProcessTaskCommands[]
  return {
    ...other,
    process_task_commands: list,
  }
}

/**
 * 工序聚合 将物料工序和组合工序的text修改为物料工序和组合工序
 * @param templateConfig 请求回来的模板
 * @returns 修改后的模板
 */
export const templateConfigContentsColumnsChange = (
  templateConfig: TemplateConfig,
) => {
  templateConfig.contents = _.forEach(templateConfig.contents, (item) => {
    _.forEach(item.columns, (item) => {
      if (['物料工序', '组合工序'].includes(item.head)) {
        item.head === '组合工序'
          ? (item.text = t('{{列.组合工序}}'))
          : (item.text = t('{{列.物料工序}}'))
      }
    })
  })
  return templateConfig
}
