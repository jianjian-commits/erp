import BatchActionBarComponent from '@/common/components/batch_action_bar'
import { openNewTab, toFixed } from '@/common/util'
import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import DiyBatchPrint from '@/pages/production/components/diy_batch_print'
import planStore from '@/pages/production/plan_management/plan/store'
import HeaderTip from '@/pages/production/plan_management/plan/task/components/list/components/header_tip'
import SubTableIndex from '@/pages/production/plan_management/plan/task/components/list/components/sub_table'
import UpdateTaskModal from '@/pages/production/plan_management/plan/task/components/list/updateTask'
import { descTest, headTest } from '@/pages/production/util'
import { MergeType } from '@/pages/system/template/print_template/production_template/interface'
import globalStore from '@/stores/global'
import { BoxTableProps, Flex, RightSideModal } from '@gm-pc/react'
import { Button, Modal, Progress, Space, Table, Tag } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { TableRowSelection } from 'antd/lib/table/interface'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  PrintingTemplate_TemplateProductionType,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import {
  map_ProcessTask_State,
  ProcessTask_State,
  ProduceType,
} from 'gm_api/src/production'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import qs from 'query-string'
import React, { FC, useEffect, useMemo, useState } from 'react'
import {
  AMOUT_TYPE,
  mergeTypeArray,
  printTypeArray,
  PRINT_COMMAND_VAlUE,
  SHOW_OVERFLOW,
  TRANSFORM_PRODUCT_PRINT_TYPE,
} from '../../enum'
import type { MapProcessTaskDetail } from '../../interface'
import store from '../../store'
import TaskDetail from '../../task_detail'
import PackBatchOutput from '../batch_output/pack_batch_output'
import ProductionBatchOutput from '../batch_output/production_batch_output'
import MaterialName from './components/material_name'
import Operation from './components/operation'
import PackAmount from './components/pack_amount'
import ProductionAmount from './components/production_amount'
import SelectProcessor from './components/select_processor'

interface Props extends Pick<BoxTableProps, 'pagination'> {
  type?: ProduceType
  onSearch: () => void
}

const List: FC<Props> = ({ type, pagination, onSearch }) => {
  const [visible, setVisible] = useState(false)
  const [taskState, setTaskState] = useState(ProcessTask_State.STATE_STARTED)
  const isPack = !planStore.producePlanCondition.isProduce
  const { list, count } = store
  const commandInfo =
    type === ProduceType.PRODUCE_TYPE_DELICATESSEN
      ? t('组合工序不展示用料数量，可点击工单编号在详情中查看')
      : undefined
  const handleOpenDetail = (id: string, is_combine: boolean): void => {
    RightSideModal.render({
      style: { width: '70%' },
      onHide: RightSideModal.hide,
      children: (
        <TaskDetail
          process_task_id={id}
          is_pack={isPack}
          is_combine={is_combine}
        />
      ),
    })
  }

  const updateTask = () => {
    setVisible((v) => !v)
  }

  const column: ColumnType<MapProcessTaskDetail>[] = useMemo(
    () => [
      {
        title: t('任务编号'),
        dataIndex: 'serial_no',
        key: 'serial_no',
        width: 170,
        align: 'center',
        render: (_, v) => {
          const { processor, process_task } = v
          const { process_task_id, serial_no, inputs } = process_task
          const is_combine = inputs!.inputs!.length >= 2
          return (
            <span>
              {processor === '0' && <Tag color='blue'>未分配车间</Tag>}
              <a
                className='gm-text-primary gm-cursor'
                onClick={() => handleOpenDetail(process_task_id, is_combine)}
              >
                {serial_no}
              </a>
            </span>
          )
        },
      },
      {
        title: t(`${isPack ? '包装' : '生产'}成品`),
        dataIndex: 'outputs_name',
        key: 'outputs_name',
        width: 170,
        align: 'center',
        render: (_, v) => {
          return (
            <MaterialName
              outputs={v.process_task_relations}
              nameType={SHOW_OVERFLOW.output}
            />
          )
        },
      },
      {
        title: t('任务状态'),
        dataIndex: 'state',
        key: 'state',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { state } = v.process_task!
          return map_ProcessTask_State[state!]
        },
      },
      {
        title: () => (
          <HeaderTip
            header={t('任务进度')}
            tip={t(
              `${
                isPack
                  ? '实际产出数量（包装单位）/理论产出数量（包装单位）*100%'
                  : '实际产出数量/理论产出数量*100%'
              }`,
            )}
          />
        ),
        dataIndex: 'main_percent',
        key: 'main_percent',
        width: 180,
        align: 'center',
        render: (_, v) => {
          const { process_task } = v
          const { actual_amount, plan_amount } =
            process_task!.main_output!.material!
          const percent = Big(+actual_amount! || 0)
            .div(+plan_amount! || '1')
            .times(100)
          return (
            <Flex justifyCenter>
              <Progress
                style={{ width: '80%' }}
                percent={percent.toNumber()}
                format={() => (
                  <div className='gm-text-12'>{toFixed(percent!, 2) + '%'}</div>
                )}
              />
            </Flex>
          )
        },
      },
      {
        title: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '实际', '投料')}</span>
                <span>{t('（基本单位）')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        dataIndex: 'inputs_actual',
        key: 'inputs_actual',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { inputs, main_output } = v.process_task!
          const material = inputs!.inputs![0]?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={main_output!.material!}
                  isBaseUnit
                  type={AMOUT_TYPE.baseUnitActual}
                  ssuInfo={v.ssuInfo!}
                />
              ) : (
                <ProductionAmount
                  material={material}
                  type='actual'
                  hidden={inputs!.inputs!.length >= 2}
                />
              )}
            </>
          )
        },
      },
      {
        title: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '实际', '产出')}</span>
                <span>{descTest(isPack, '包装')}</span>
              </Flex>
            }
          />
        ),
        dataIndex: 'main_actual',
        key: 'main_actual',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { main_output } = v.process_task!
          const material = main_output?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.actual}
                  ssuInfo={v.ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='actual' />
              )}
            </>
          )
        },
      },
      {
        title: t('工序'),
        dataIndex: 'process',
        key: 'process',
        width: 120,
        align: 'center',
        render: (_, v) => {
          const { process_name } = v.process_task!
          return process_name
        },
      },
      {
        title: t('工序参数'),
        dataIndex: 'process_name',
        key: 'process_name',
        width: 170,
        align: 'center',
        render: (_, v) => {
          const { attrs } = v.process_task!
          return (
            <MaterialName
              attrs={attrs!.attrs!}
              nameType={SHOW_OVERFLOW.attrs}
            />
          )
        },
      },
      {
        title: t('物料名称'),
        dataIndex: 'inputs_name',
        key: 'nputs_name',
        width: 170,
        align: 'center',
        render: (_, v) => {
          const { inputs } = v.process_task!
          return (
            <MaterialName
              inputs={inputs!.inputs!}
              nameType={SHOW_OVERFLOW.input}
            />
          )
        },
      },
      {
        title: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '理论', '用料')}</span>
                <span>{t('（基本单位）')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        dataIndex: 'inputs_plan',
        key: 'inputs_plan',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { inputs, main_output } = v.process_task!
          const material = inputs!.inputs![0]?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={main_output!.material!}
                  isBaseUnit
                  type={AMOUT_TYPE.plan}
                  ssuInfo={v.ssuInfo!}
                  packRate={v.packRate}
                />
              ) : (
                <ProductionAmount
                  material={material}
                  type='plan'
                  hidden={inputs!.inputs!.length >= 2}
                />
              )}
            </>
          )
        },
      },
      {
        title: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '理论', '产出')}</span>
                <span>{descTest(isPack, '包装')}</span>
              </Flex>
            }
          />
        ),
        dataIndex: 'main_plan',
        key: 'main_plan',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { main_output } = v.process_task!
          const material = main_output?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.plan}
                  ssuInfo={v.ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='plan' />
              )}
            </>
          )
        },
      },
      {
        title: t('关联车间-小组'),
        dataIndex: 'processor',
        key: 'processor',
        width: 200,
        align: 'center',
        render: (_, v, index) => {
          return (
            <Observer>
              {() => {
                const { edit, processor } = v
                return edit ? (
                  <SelectProcessor
                    processor={processor}
                    onChange={(value: string) =>
                      store.updateProcessTaskInfo(index, 'processor', value)
                    }
                  />
                ) : (
                  <div>{store.getProcessorName(processor)}</div>
                )
              }}
            </Observer>
          )
        },
      },
      {
        title: t('关联客户'),
        dataIndex: 'target_customer_id',
        key: 'target_customer_id',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { customerName } = v.process_task!
          return <div>{customerName || '-'}</div>
        },
      },
      {
        title: t('关联线路'),
        dataIndex: 'target_route_id',
        key: 'target_route_id',
        width: 140,
        align: 'center',
        render: (_, v) => {
          const { routerName } = v.process_task!
          return <div>{routerName || '-'}</div>
        },
      },
      {
        title: t('需求备注'),
        dataIndex: 'batch',
        key: 'batch',
        width: 90,
        align: 'center',
        render: (_, v) => {
          return <div>{v.process_task.batch || '-'}</div>
        },
      },
      {
        title: t('创建时间'),
        dataIndex: 'create_time',
        key: 'create_time',
        width: 140,
        align: 'center',
        render: (_, { process_task }) => {
          const { create_time } = process_task!!
          return moment(new Date(+create_time!)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        title: t('任务交期'),
        dataIndex: 'delivery_times',
        width: 160,
        align: 'center',
        render: (_, { process_task }) => {
          const { delivery_times } = process_task
          let allTime =
            delivery_times
              ?.split(',')
              .reduce((allTime, time) => {
                allTime.push(time)
                return allTime
              }, [] as string[])
              .join(', ') || '-'
          allTime = allTime.split(' ')[0]
          return <EllipsesText text={allTime} maxLength={19} />
        },
      },
      {
        title: t('指导配料'),
        dataIndex: 'ingredients',
        key: 'ingredients',
        width: 170,
        align: 'center',
        render: (_, v) => {
          const { raw_inputs } = v.process_task!
          return (
            <MaterialName
              match={raw_inputs!.inputs!}
              nameType={SHOW_OVERFLOW.raw_input}
            />
          )
        },
      },
      {
        title: t('操作'),
        dataIndex: 'operation',
        key: 'operation',
        fixed: 'right',
        width: 120,
        align: 'center',
        render: (_, v, index) => {
          const { ssuInfo, process_task } = v
          const { unit_id } = process_task!.main_output!.material!
          const unit_name = isPack
            ? ssuInfo?.ssu?.unit.name
            : globalStore.getUnitName(unit_id!)
          return (
            <Operation
              index={index}
              unitName={unit_name}
              // eslint-disable-next-line react/jsx-handler-names
              onChange={store.updateProcessTaskInfo}
            />
          )
        },
      },
    ],
    [],
  )

  const getPrintBatchActions = () => {
    const { selectAll, selectedRowKeys } = store
    if (isPack) {
      return [
        getPrintBatchAction(ProduceType.PRODUCE_TYPE_PACK)({
          selectedRowKeys,
          selectAll,
        }),
      ]
    } else {
      return [
        getPrintBatchAction(ProduceType.PRODUCE_TYPE_CLEANFOOD)({
          selectedRowKeys,
          selectAll,
        }),
        getPrintBatchAction(ProduceType.PRODUCE_TYPE_DELICATESSEN)({
          selectedRowKeys,
          selectAll,
        }),
      ]
    }
  }

  const getPrintBatchAction = (type: ProduceType) => {
    const printTypeText =
      type === ProduceType.PRODUCE_TYPE_CLEANFOOD
        ? '单品'
        : type === ProduceType.PRODUCE_TYPE_DELICATESSEN
        ? '组合'
        : ''
    return (params: { selectedRowKeys: string[]; selectAll: boolean }) => (
      <Button
        disabled={
          store.selectedRowKeys.length === 0 ||
          !isPrintActionVisible(type, store.selectedRowKeys, params.selectAll)
        }
        onClick={() => {
          store.setShowPrintModal(type, true)
        }}
      >
        {t(`打印${printTypeText}生产单`)}
        <Observer>
          {() => showPrintModal(type, params.selectedRowKeys, params.selectAll)}
        </Observer>
      </Button>
    )
  }

  const isPrintActionVisible = (
    type: ProduceType,
    selected: string[],
    isSelectAll: boolean,
  ) => {
    const { list } = store
    if (isPack) {
      return type === ProduceType.PRODUCE_TYPE_PACK
    }

    if (type === ProduceType.PRODUCE_TYPE_PACK) {
      return false
    }

    if (isSelectAll) {
      return true
    }
    return list.some(
      (task) =>
        selected.indexOf(task.process_task_id) > -1 &&
        task.process_task.type === type,
    )
  }
  const showPrintModal = (
    type: ProduceType,
    selected: string[],
    isSelectAll: boolean,
  ) => {
    const { showPrintModal } = store
    const filter = store.getSearchTaskData(type)
    return (
      <Modal
        visible={showPrintModal[type]}
        title='批量打印'
        onCancel={(e) => {
          e.stopPropagation()
          store.setShowPrintModal(type, false)
        }}
        footer={null}
        width={900}
        bodyStyle={{ paddingTop: 0, height: 450 }}
      >
        <DiyBatchPrint
          type={PrintingTemplate_Type.TYPE_PRODUCTION}
          id={`isTaskProduce${TRANSFORM_PRODUCT_PRINT_TYPE[type]}`}
          printProduceType={TRANSFORM_PRODUCT_PRINT_TYPE[type]}
          printTypeArray={printTypeArray}
          mergeTypeArray={
            TRANSFORM_PRODUCT_PRINT_TYPE[type] !==
            PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_PACK
              ? mergeTypeArray
              : undefined
          }
          defaultPrint={PRINT_COMMAND_VAlUE.material_production}
          defaultMerge={MergeType.TYPE_PROCESS}
          onCancel={(e) => {
            e.stopPropagation()
            store.setShowPrintModal(type, false)
          }}
          onOk={({ mergeData, printData, printId }) => {
            const query: string = qs.stringify({
              filter: JSON.stringify(
                !isSelectAll
                  ? Object.assign(filter, {
                      process_task_ids: selected,
                    })
                  : filter,
              ),
              level: printData,
              mergeType: isPack ? MergeType.TYPE_PACK : mergeData,
              printId,
            })
            openNewTab(
              `#/system/template/print_template/production_template/print/?${query}`,
            )
            store.setShowPrintModal(type, false)
          }}
        />
      </Modal>
    )
  }

  const handleBatchOutput = (selected: string[]) => {
    store.getOutputTaskList(selected)
    RightSideModal.render({
      title: t('产出'),
      children: isPack ? <PackBatchOutput /> : <ProductionBatchOutput />,
      onHide: RightSideModal.hide,
      style: { width: '65%' },
    })
  }
  /**
   * @description 全选
   * @param params 是否勾选所有页
   */
  const handleToggleSelectAll = (params: boolean) => {
    store.setselectAll(params)
    store.setSelectedRowKeys(_.map(list, (item) => item.process_task_id))
  }

  /** 勾选 */
  const handleSelected = (selectedRowKeys: string[]) => {
    store.setSelectedRowKeys(selectedRowKeys)
    if (store.selectedRowKeys.length < store.list.length) {
      store.setselectAll(false)
    }
  }

  /** 取消选中 */
  const cancelSelect = () => {
    store.setSelectedRowKeys([])
    store.setselectAll(false)
  }

  const rowSelection: TableRowSelection<MapProcessTaskDetail> = {
    selectedRowKeys: store.selectedRowKeys,
    checkStrictly: false,
    onChange: (value) => handleSelected(value as string[]),
  }

  useEffect(() => {
    store.setSelectedRowKeys([])
  }, [])

  return (
    <>
      <Flex alignCenter className='tw-my-3'>
        <BatchActionBarComponent
          selected={store.selectedRowKeys}
          onClose={cancelSelect}
          isSelectAll={store.selectAll}
          toggleSelectAll={handleToggleSelectAll}
          count={store.selectAll ? count : store.selectedRowKeys.length}
          ButtonNode={
            <Space size='middle'>
              <Button
                disabled={store.selectedRowKeys.length === 0}
                onClick={() => {
                  updateTask()
                  setTaskState(ProcessTask_State.STATE_STARTED)
                  onSearch()
                }}
              >
                {t('开始任务')}
              </Button>
              <Button
                disabled={store.selectedRowKeys.length === 0}
                onClick={() => {
                  handleBatchOutput(store.selectedRowKeys)
                }}
              >
                {t('产出')}
              </Button>
              <Button
                disabled={store.selectedRowKeys.length === 0}
                onClick={() => {
                  updateTask()
                  setTaskState(ProcessTask_State.STATE_FINISHED)
                  onSearch()
                }}
              >
                {t('标记完工')}
              </Button>
              {getPrintBatchActions()}
            </Space>
          }
        />
      </Flex>
      <Table<MapProcessTaskDetail>
        dataSource={list.slice()}
        columns={column.filter((column) => {
          // 根据条件过滤掉不显示的栏
          switch (column.key) {
            case 'process':
            case 'process_name':
              return !isPack

            case 'ingredients':
              return isPack

            case 'operation':
              return type === ProduceType.PRODUCE_TYPE_PACK
                ? globalStore.hasPermission(
                    Permission.PERMISSION_PRODUCTION_UPDATE_PACK_PROCESS_TASK,
                  )
                : globalStore.hasPermission(
                    Permission.PERMISSION_PRODUCTION_UPDATE_PRODUCTION_PROCESS_TASK,
                  )

            default:
              return true
          }
        })}
        scroll={{ x: 1300 }}
        pagination={false}
        rowSelection={rowSelection}
        rowKey='key'
        sticky
        expandable={{
          expandedRowRender: (recond, index) =>
            SubTableIndex({ process_index: index, type: type }),
        }}
      />
      <UpdateTaskModal
        visible={visible}
        onChangeVisible={updateTask}
        state={taskState}
        onSearch={onSearch}
      />
    </>
  )
}

export default observer(List)
