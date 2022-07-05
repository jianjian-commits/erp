import { toFixed } from '@/common/util'
import { addProductUnit } from '@/pages/merchandise/manage/util'
import {
  ProcessTaskDetailExpand,
  PurchaseTaskExpand,
} from '@/pages/production/task/interface'
import {
  MaterialName,
  PackAmount,
  ProductionAmount,
} from '@/pages/production/task_command/components/list/components'
import { AMOUT_TYPE, SHOW_OVERFLOW } from '@/pages/production/task_command/enum'
import { getProcessPickMain } from '@/pages/production/util'
import globalStore, { UnitGlobal } from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { ColumnType } from 'antd/lib/table'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import {
  ListProcessor,
  ListTask,
  map_ProcessTask_State,
  map_Task_State,
  OutputType,
  Processor,
  ProduceType,
  Task,
} from 'gm_api/src/production'
import { map_PurchaseTask_Status } from 'gm_api/src/purchase'
import _ from 'lodash'
import moment from 'moment'
import React, { FC, useEffect, useRef, useState } from 'react'
import { CollapseTable } from '..'

const childrenColumns: ColumnType<Task>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (_, __, index) => {
      return index + 1
    },
  },
  {
    title: '计划交期',
    dataIndex: 'delivery_time',
    key: 'delivery_time',
    render: (_, data) => {
      return moment(data.delivery_time, 'x').format('MM-DD')
    },
  },
  {
    title: '需求编号',
    dataIndex: 'serial_no',
    key: 'serial_no',
    render: (_, data) => {
      return data.serial_no
    },
  },
  {
    title: '生产成品',
    dataIndex: 'sku_name',
    key: 'sku_name',
    render: (_, data) => {
      return data.sku_name
    },
  },
  {
    title: '生产成品需求数',
    dataIndex: 'order_amount',
    key: 'order_amount',
    render: (_, data) => {
      const { order_amount, unit_id } = data
      return toFixed(+order_amount) + globalStore.getUnitName(unit_id)
    },
  },
  {
    title: '需求状态',
    dataIndex: 'state',
    key: 'state',
    render: (_, data) => {
      return map_Task_State[data.state!]
    },
  },
]

const purchaseColumns: ColumnType<PurchaseTaskExpand>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (_, __, index) => {
      return index + 1
    },
  },
  {
    title: '计划交期',
    dataIndex: 'purchase_time',
    key: 'purchase_time',
    render: (_, data) => {
      return moment(data.purchase_time, 'x').format('MM-DD HH:mm')
    },
  },
  {
    title: '计划编号',
    dataIndex: 'serial_no',
    key: 'serial_no',
    render: (_, data) => {
      return data.serial_no
    },
  },
  {
    title: '商品',
    dataIndex: 'skuInfo',
    key: 'skuInfo',
    render: (_, data) => {
      return data.skuInfo.sku?.name
    },
  },
  {
    title: '需求数',
    dataIndex: 'num',
    key: 'num',
    render: (__, data) => {
      const {
        request_details: { request_details },
        request_value,
        task_ids,
      } = data
      const unitId = request_value?.input?.unit_id!
      const unitName = +unitId > 10000 ? globalStore.getUnitName(unitId) : ''
      const num = +_.reduce(
        _.filter(request_details, ({ request_sheet_id }) =>
          task_ids.includes(request_sheet_id!),
        ),
        (all, next) => all.add(next.sheet_value?.calculate?.quantity!),
        Big(0),
      )
      return num ? toFixed(num) + unitName : '-'
    },
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    key: 'status',
    render: (_, data) => {
      return map_PurchaseTask_Status[data.status]
    },
  },
]

interface RelatedTableProps {
  /** 已选任务的ID */
  task_ids: string[]
  /** 设置渲染的状态 */
  setRender: (rendered: boolean) => void
}

// 定义关联下游计划、任务、采购计划表格
const RelatedTable: FC<RelatedTableProps> = ({ task_ids, setRender }) => {
  const ProcessorData = useRef<Processor[]>([])
  const skuData = useRef<{ [key: string]: GetManySkuResponse_SkuInfo }>({})

  // 需要用到ProcessorData和skuData 所以放里面
  const processColumns: ColumnType<ProcessTaskDetailExpand>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => {
        return index + 1
      },
    },
    {
      title: '任务交期',
      dataIndex: 'delivery_time',
      key: 'delivery_time',
      render: (_, data) => {
        return moment(data.delivery_time, 'x').format('MM-DD HH:mm')
      },
    },
    {
      title: '任务编号',
      dataIndex: 'serial_no',
      key: 'serial_no',
      render: (_, data) => {
        return data.serial_no
      },
    },
    {
      title: '工序',
      dataIndex: 'process_name',
      key: 'process_name',
      render: (_, data) => {
        return data.process_name
      },
    },
    {
      title: '关联车间',
      dataIndex: 'processor',
      key: 'processor',
      render: (__, data) => {
        return (
          <div>
            {_.find(
              ProcessorData.current,
              (value) => value.processor_id === data.processor,
            )?.name! || '-'}
          </div>
        )
      },
    },
    {
      title: '生产成品',
      dataIndex: 'skuData',
      key: 'skuData',
      render: (_, data) => {
        return (
          <MaterialName
            outputs={data.process_task_relations}
            nameType={SHOW_OVERFLOW.output}
            skuList={skuData.current}
          />
        )
      },
    },
    {
      title: '物料名称',
      dataIndex: 'task_inputs',
      key: 'task_inputs',
      render: (_, data) => {
        return (
          <MaterialName
            inputs={data.inputs!.inputs!}
            nameType={SHOW_OVERFLOW.input}
            skuList={skuData.current}
          />
        )
      },
    },
    {
      title: '理论产出数量',
      dataIndex: 'material',
      key: 'material',
      align: 'center',
      render: (__, data) => {
        const {
          process_task_relations,
          main_output,
          ssuInfo,
          task_ids,
          isPack,
          unitList,
        } = data
        const { unit_id: baseUnitId } = main_output?.material!

        const material = {
          ...main_output?.material!,
          plan_amount: _.reduce(
            _.filter(process_task_relations, ({ task_id }) =>
              task_ids.includes(task_id!),
            ),
            (all, next) => {
              // 过滤type不为1的
              const outputs = _.filter(
                next.outputs?.outputs,
                ({ type }) => type === OutputType.OUTPUT_TYPE_MAIN,
              )
              return all.add(
                _.reduce(
                  outputs,
                  (outPutAll, outPutNext) => {
                    const { unit_id, plan_amount } = outPutNext.material!
                    // 包装不做换算
                    const rate = isPack
                      ? 1
                      : +(_.find(unitList, {
                          value: unit_id,
                        })?.rate as string) /
                        +(_.find(unitList, {
                          value: baseUnitId,
                        })?.rate as string)

                    return outPutAll.add(Big(plan_amount).times(rate))
                  },
                  Big(0),
                ),
              )
            },
            Big(0),
          ).toString(),
        }

        // 是否包装
        return (
          <Flex justifyCenter>
            {isPack ? (
              <PackAmount
                material={material}
                type={AMOUT_TYPE.plan}
                ssuInfo={ssuInfo!}
              />
            ) : (
              <ProductionAmount material={material} type='plan' />
            )}
          </Flex>
        )
      },
    },
    {
      title: '任务状态',
      dataIndex: 'state',
      key: 'state',
      render: (_, data) => {
        return map_ProcessTask_State[data.state!]
      },
    },
  ]

  const [taskData, setData] = useState<{
    children_tasks: Task[]
    process_tasks: ProcessTaskDetailExpand[]
    purchase_tasks: PurchaseTaskExpand[]
  }>({ children_tasks: [], process_tasks: [], purchase_tasks: [] })

  useEffect(() => {
    setRender(false)
  }, [])

  useEffect(() => {
    ListProcessor()
      .then((json) => {
        ProcessorData.current = json.response.processors
        return ListTask({
          task_ids,
          need_children_task: true,
          need_process_task: true,
          need_purchase_task: true,
          paging: { limit: 999 },
        })
      })
      .then((res) => {
        const { children_tasks, process_task_details, purchase_tasks, skus } =
          res.response
        const unitSomeArray = globalStore.getSameUnitArray()
        // 包含下游计划的id
        const allTaskIds = [
          ...task_ids,
          ..._.map(children_tasks, ({ task_id }) => task_id),
        ]
        skuData.current = skus!
        setData({
          children_tasks,
          process_tasks: _.map(
            process_task_details,
            ({
              process_task_commands,
              process_task_relations,
              process_task,
            }) => {
              const isPack =
                process_task?.type === ProduceType.PRODUCE_TYPE_PACK
              const { main_output } = process_task!
              const { base_unit_id, sku_id } = main_output?.material!

              return {
                ...process_task!,
                process_task_commands,
                process_task_relations,
                isPack,
                ssuInfo: isPack
                  ? getProcessPickMain(process_task, skus!)
                  : undefined,
                task_ids: allTaskIds,
                // 包装不做换算
                unitList: isPack
                  ? []
                  : (addProductUnit(
                      base_unit_id!,
                      skuData.current[sku_id!].sku?.production_unit!,
                      _.find(unitSomeArray, (v) =>
                        v.unitArrayId.includes(base_unit_id!),
                      )?.unitArray,
                    ) as UnitGlobal[]),
              }
            },
          ),
          purchase_tasks: _.map(purchase_tasks, (v) => ({
            ...v,
            skuInfo: skus![v.sku_id],
            task_ids: allTaskIds,
          })),
        })
        setRender(true)
      })
  }, [task_ids])

  return (
    <>
      {taskData.children_tasks.length > 0 && (
        <CollapseTable<Task>
          className='box'
          header={t('关联下游需求')}
          columns={childrenColumns}
          data={taskData.children_tasks}
        />
      )}
      {taskData.process_tasks.length > 0 && (
        <CollapseTable<ProcessTaskDetailExpand>
          className='box'
          header={t('关联任务')}
          columns={processColumns}
          data={taskData.process_tasks}
        />
      )}
      {taskData.purchase_tasks.length > 0 && (
        <CollapseTable<PurchaseTaskExpand>
          className='box'
          header={t('关联采购计划')}
          columns={purchaseColumns}
          data={taskData.purchase_tasks}
        />
      )}
    </>
  )
}

export default RelatedTable
