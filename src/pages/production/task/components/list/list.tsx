import HeaderTip from '@/common/components/header_tip'
import PermissionJudge from '@/common/components/permission_judge'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'
import { openNewTab } from '@/common/util'
import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import DiyBatchPrint from '@/pages/production/components/diy_batch_print'
import ConfirmBoxContent from '@/pages/production/task/components/list/confirm_box_content'
import {
  printPickArray,
  PRINT_PICK_ENUM,
} from '@/pages/production/task_command/enum'
import globalStore from '@/stores/global'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Button,
  Confirm,
  Flex,
  RightSideModal,
} from '@gm-pc/react'
import { BatchActionDefault, Column, Table, TableXUtil } from '@gm-pc/table-x'
import { message, Modal } from 'antd'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  CategoryInfo,
  map_Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import {
  PrintingTemplate_Type,
  ProductionSettings_TaskOutputSource,
} from 'gm_api/src/preference'
import {
  Bom,
  CheckTaskBomChanged,
  map_BomType,
  map_Task_State,
  Task,
  Task_State,
  Task_Type,
} from 'gm_api/src/production'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import moment from 'moment'
import qs from 'query-string'
import React, { FC, useMemo, useState } from 'react'
import Detail from '../../../task_detail'
import { getBatchActionContent, toFixed } from '../../../util'
import type { TaskInfo } from '../../interface'
import store from '../../store'
import PackBatchOutput from '../batch_output/pack_batch_output'
import ProductionBatchOutput from '../batch_output/production_batch_output'
import Action from './action'
import CellPlanAmount from './cell_plan_amount'
import CellTaskSchedule from './cell_task_schedule'
import { ReplaceBomDrawer } from './components'
import PlanAmountInfo from './plan_amount_info'

const { OperationDelete } = TableXUtil

interface Props extends Pick<BoxTableProps, 'pagination'> {
  type?: Task_Type
}

const List: FC<Props> = observer(({ type, pagination }) => {
  const TASK_TEXT = type ? t('包装') : t('生产')
  const TASK_UNIT_TYPE = type ? t('(包装单位)') : t('(基本单位)')
  const { taskList, loading, paging } = store
  const isPack = type === Task_Type.TYPE_PACK
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  /**
   * 批量操作时获取24小时内有更改的BOM
   * @param  {string}         key         批量操作的名称
   * @param  {string[]}       selected    当前已选的计划
   * @param  {boolean}        isSelectAll 是否选择全部页的任务
   * @return {Promise<Bom[]>}             获取更改的BOM的请求
   */
  const checkChangedBom = (
    key: string,
    selected: string[],
    isSelectAll: boolean,
  ): Promise<Bom[]> => {
    return new Promise((resolve) => {
      if (key !== 'order_plan') {
        resolve([])
        return
      }
      const taskIds = isSelectAll
        ? store.taskList.map((task) => task.task_id)
        : selected
      CheckTaskBomChanged({ task_ids: taskIds }).then((response) => {
        resolve(response.response.boms || [])
      })
    })
  }

  const handleBatchActionSelect = (
    key: string,
    selected: string[],
    isSelectAll: boolean,
  ) => {
    const { title, context, isRelease } = getBatchActionContent(key, isPack)
    checkChangedBom(key, selected, isSelectAll)
      .then((boms) => {
        return Confirm({
          title,
          size: 'md',
          children: (
            <ConfirmBoxContent
              context={context}
              isPack={isPack}
              isRelease={isRelease}
              changedBoms={boms}
            />
          ),
        })
      })
      .then(() => {
        return store.batchUpdateTask(key, selected, isSelectAll, type)
      })
      .then(() => {
        if (key !== 'order_plan') return
        globalStore.showTaskPanel('1')
        return null
      })
  }

  const handleToPlanDetail = (
    index: number,
    id: string,
    task_state: number,
  ) => {
    RightSideModal.render({
      style: { width: '70%' },
      onHide: RightSideModal.hide,
      children: (
        <Detail
          index={index}
          type={type}
          task_id={id}
          task_state={task_state}
        />
      ),
    })
  }

  const handleBatchOutput = (selected: string[]) => {
    const { productionSetting } = globalStore
    const isSingleAutoOutput =
      productionSetting.task_output_source ===
      ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
    const isComboAutoOutput =
      productionSetting.task_output_source_combination ===
      ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS

    const selectedTasks = (
      store.taskDetails?.task_details?.filter((taskDetail) => {
        // 非空校验，过滤掉空的
        if (!taskDetail.task || !taskDetail.task.task_id) {
          return false
        }
        // 过滤掉未选中的
        if (selected.indexOf(taskDetail.task.task_id) === -1) {
          return false
        }
        // 过滤掉未下单的
        if (taskDetail.task.state === Task_State.STATE_PREPARE) {
          return false
        }
        // 包装产出直接返回
        if (isPack) {
          return true
        }
        // 如果设置了单品默认产出，则过滤掉单品的
        if (isSingleAutoOutput) {
          return taskDetail.task.type !== Task_Type.TYPE_PRODUCE_CLEANFOOD
        }
        // 如果设置了组合默认产出，则过滤掉组合的
        if (isComboAutoOutput) {
          return taskDetail.task.type !== Task_Type.TYPE_PRODUCE
        }
        // 都没有设置默认产出就直接返回
        return true
      }) || []
    ).map((task) => ({ ...task.task } as Task))

    store.getOutputTaskList(selectedTasks, type === Task_Type.TYPE_PACK)
    RightSideModal.render({
      title: t('产出'),
      children: !isPack ? (
        <ProductionBatchOutput
          isSingleAutoOutput={isSingleAutoOutput}
          isComboAutoOutput={isComboAutoOutput}
        />
      ) : (
        <PackBatchOutput />
      ),
      onHide: RightSideModal.hide,
      style: { width: '65%' },
    })
  }

  const handleCreate = () => {
    if (type === Task_Type.TYPE_PACK) {
      history.push('/production/task/pack_task/create')
      return
    }
    history.push('/production/task/production_task/create')
  }

  const handleSelect = (select: string[]) => {
    setSelected(select)
  }

  const handleInvalidate = (index: number) => {
    store.invalidateTask(index)
  }

  const hasProductionDeletePermission = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_DELETE_PRODUCETASK,
  )
  const hasPackDeletePermission = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_DELETE_PACKTASK,
  )
  const hasDeletePermission =
    type !== Task_Type.TYPE_PACK
      ? hasProductionDeletePermission
      : hasPackDeletePermission

  const hasProductionEditPermission = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_UPDATE_PRODUCETASK,
  )
  const hasPackEditPermission = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_UPDATE_PACKTASK,
  )
  const hasEditPermission =
    type !== Task_Type.TYPE_PACK
      ? hasProductionEditPermission
      : hasPackEditPermission

  const columns: Column<TaskInfo>[] = useMemo(() => {
    return [
      {
        Header: t('创建时间'),
        accessor: 'create_time',
        minWidth: 80,
        fixed: 'left',
        Cell: ({ original }) => {
          const { create_time } = original
          return moment(new Date(+create_time)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('计划交期'),
        accessor: 'delivery_time',
        minWidth: 80,
        fixed: 'left',
        Cell: ({ original }) => {
          const { delivery_time } = original
          return moment(new Date(+delivery_time)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('计划编号'),
        accessor: 'serial_no',
        width: 150,
        diyEnable: false,
        fixed: 'left',
        Cell: ({ index, original }) => {
          const { task_id, state, serial_no } = original
          return (
            <a
              className='gm-text-primary gm-cursor'
              style={{ textDecoration: 'underline' }}
              onClick={() => handleToPlanDetail(index, task_id, state!)}
            >
              {serial_no}
            </a>
          )
        },
      },
      {
        Header: t(`${isPack ? '包装' : '生产'}成品`),
        accessor: 'sku_name',
        diyEnable: false,
        width: 170,
        Cell: ({ original }) => {
          const { sku_name } = original
          return <EllipsesText text={sku_name} />
        },
      },
      {
        Header: t('BOM名称'),
        accessor: 'bom_name',
        width: 170,
        Cell: ({ original }) => {
          const { bom_name } = original
          return <EllipsesText text={bom_name} />
        },
      },
      {
        Header: t('BOM类型'),
        accessor: 'bom_type',
        minWidth: 80,
        Cell: ({ original }) => {
          const { type } = original
          return map_BomType[type]
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'sku_type',
        minWidth: 80,
        Cell: ({ original }) => {
          const { sku_type } = original
          return map_Sku_NotPackageSubSkuType[sku_type] || '-'
        },
      },
      {
        Header: t('分类'),
        accessor: 'category_name',
        width: 170,
        Cell: ({ original }) => {
          const { sku_id } = original
          const { skus } = store.taskDetails
          const category_infos: CategoryInfo[] =
            ((skus && skus[sku_id || '']) || { category_infos: [] })
              .category_infos || []
          const categories = category_infos.length
            ? _.map(category_infos, (c) => c.category_name || '-').join('/')
            : '-'
          return <EllipsesText text={categories} />
        },
      },
      {
        Header: t('关联客户'),
        accessor: 'target_customer_id',
        width: 170,
        Cell: ({ original }) => {
          const { customer_name } = original
          return <EllipsesText text={customer_name || '-'} />
        },
      },
      {
        Header: t('关联线路'),
        accessor: 'target_router_id',
        width: 170,
        Cell: ({ original }) => {
          const { router_name } = original
          return <EllipsesText text={router_name || '-'} />
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column alignCenter justifyCenter>
                <span>{t('需求数')}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
            tip={
              <>
                {t('1.来自订单：需求数=下单数。')}
                <br />
                {t('2.来自手工新建：需求数=手工创建的生产数。')}
              </>
            }
          />
        ),
        diyItemText: t('需求数'),
        accessor: 'order_amount',
        minWidth: 100,
        Cell: ({ original }) => {
          const { unit_name, order_amount } = original
          return (
            <div>
              {order_amount
                ? `${toFixed(order_amount || '0')}${unit_name}`
                : '-'}
            </div>
          )
        },
      },
      // {
      //   Header: (
      //     <HeaderTip
      //       header={t('库存')}
      //       info={t('库存数读取库存总览中实时可用库存')}
      //       desc={TASK_UNIT_TYPE}
      //     />
      //   ),
      //   diyItemText: t('库存'),
      //   accessor: 'stock_amount',
      //   width: 80,
      //   Cell: (cellProps: { row: { original: TaskInfo } }) => {
      //     const { stock_amount, unit_name } = cellProps.row.original
      //     return (
      //       <div>
      //         {stock_amount ? `${toFixed(stock_amount)}${unit_name}` : '-'}
      //       </div>
      //     )
      //   },
      // },
      // {
      //   Header: (
      //     <HeaderTip
      //       header={t(`建议${TASK_TEXT}`)}
      //       desc={TASK_UNIT_TYPE}
      //       info={t(
      //         `建议${TASK_TEXT}=需求数-库存，计划完成后此数值将保持不变；若库存小于0，则建议${TASK_TEXT}=需求数；若建议${TASK_TEXT}数小于0，则建议${TASK_TEXT}为“库存充足”`,
      //       )}
      //       tipStyle={{ width: '320px' }}
      //       right
      //     />
      //   ),
      //   diyItemText: t(`建议${TASK_TEXT}`),
      //   accessor: 'suggest_amount',
      //   width: 110,
      //   Cell: () => {
      //     // 系统配置有关，暂时展示为-
      //     return <div>-</div>
      //   },
      // },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{t(`计划${TASK_TEXT}`)}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
            tip={<PlanAmountInfo type={type} />}
          />
        ),
        diyItemText: t(`计划${TASK_TEXT}`),
        accessor: 'plan_amount',
        minWidth: 110,
        Cell: ({ index }) => {
          return <CellPlanAmount index={index} />
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{t(`已${TASK_TEXT}`)}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
          />
        ),
        accessor: 'output_amount',
        minWidth: 80,
        diyItemText: t(`已${TASK_TEXT}`),
        Cell: ({ original }) => {
          const { unit_name, output_amount } = original
          return (
            <div>
              {output_amount
                ? `${toFixed(output_amount || '0')}${unit_name}`
                : '-'}
            </div>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={t('计划进度')}
            tip={t(`计划进度=已${TASK_TEXT}数/计划${TASK_TEXT}数`)}
          />
        ),
        diyItemText: t('计划进度'),
        accessor: 'task_schedule',
        minWidth: 120,
        Cell: ({ index }) => {
          return <CellTaskSchedule index={index} />
        },
      },
      // {
      //   Header: t('计划波次'),
      //   accessor: 'batch',
      //   minWidth: 80,
      //   Cell: ({ original }) => {
      //     const { batch } = original
      //     if ((batch || '').length > 20) {
      //       return (
      //         <Popover
      //           showArrow
      //           type='hover'
      //           popup={
      //             <div
      //               style={{ width: '200px', wordBreak: 'break-all' }}
      //               className='gm-padding-5'
      //             >
      //               {batch}
      //             </div>
      //           }
      //           right
      //           top
      //         >
      //           <div>{batch?.substring(0, 20)}...</div>
      //         </Popover>
      //       )
      //     }
      //     return <div>{batch || t('无波次')}</div>
      //   },
      // },
      // {
      //   Header: t('计划来源'),
      //   accessor: 'source',
      //   width: 80,
      //   Cell: (cellProps: { row: { original: TaskInfo } }) => {
      //     return (
      //       <div>
      //         {cellProps.row.original.source === Task_Source.SOURCE_PLAN
      //           ? !is_pack
      //             ? t('预生产计划')
      //             : t('预包装计划')
      //           : map_Task_Source[cellProps.row.original.source!]}
      //       </div>
      //     )
      //   },
      // },
      {
        Header: t('计划状态'),
        accessor: 'state',
        minWidth: 80,
        Cell: ({ original }) => {
          const { state } = original
          return <div>{map_Task_State[state]}</div>
        },
      },
      {
        Header: t('下达时间'),
        accessor: 'release_time',
        minWidth: 100,
        Cell: ({ original }) => {
          const { release_time } = original
          return (
            <span>
              {release_time === '' || release_time === '0'
                ? '-'
                : moment(new Date(+release_time)).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          )
        },
      },
      {
        Header: t(`${TASK_TEXT}备注`),
        accessor: 'batch',
        minWidth: 100,
        Cell: ({ original }) => {
          const { batch } = original
          return <div>{batch || '-'}</div>
        },
      },
      {
        Header: TableXUtil.OperationHeader,
        accessor: 'operation',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        fixed: 'right',
        diyItemText: t('操作'),
        diyEnable: false,
        Cell: ({ index, original }) => {
          return (
            <Observer>
              {() => {
                const { state } = original
                // 计划未下达才能修改，未下达或进行中才能作废
                return (
                  <Flex style={{ gap: '8px' }}>
                    {state === Task_State.STATE_PREPARE && (
                      <Action index={index} editDisabled={!hasEditPermission} />
                    )}
                    {(state === Task_State.STATE_PREPARE ||
                      state === Task_State.STATE_STARTED) &&
                      hasDeletePermission && (
                        <OperationDelete
                          title={t('是否作废该计划')}
                          onClick={() => handleInvalidate(index)}
                        >
                          {t(
                            '警告：计划作废后，没有产出数据的关联任务和下级任务及其它们的指令和投料都将被作废，已有产出数据的计划及任务将不会被作废',
                          )}
                        </OperationDelete>
                      )}
                  </Flex>
                )
              }}
            </Observer>
          )
        },
      },
    ]
  }, [])

  const handleBatchReplaceBom = (selected: string[], isSelectAll: boolean) => {
    if (isSelectAll) {
      message.warning(t('勾选所有页内容时无法进行物料替换'))
      return
    }

    const unfinishedTaskIds = store.taskList
      .filter((task) => task.state !== Task_State.STATE_FINISHED)
      .map((task) => task.task_id)

    selected = selected.filter((taskId) => unfinishedTaskIds.includes(taskId))

    if (!selected.length) {
      message.error('仅支持未下达/进行中计划替换物料')
      return
    }

    setSelected(selected)
    setDrawerVisible(true)
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false)
    setSelected([])
  }

  // 只有生产计划才能进行合并
  const batchActions = useMemo(() => {
    const actions = [
      {
        children: <BatchActionDefault>{t('下达计划')}</BatchActionDefault>,
        onAction: (selected: string[], isSelectAll: boolean) =>
          handleBatchActionSelect('order_plan', selected, isSelectAll),
      },
      // 生产计划 -- 系统设置开启最后一道工序作为产出时不允许填产出
      {
        children: <BatchActionDefault>{t('产出')}</BatchActionDefault>,
        onAction: (selected: string[]) => handleBatchOutput(selected),
        getHidden(_: string[], isSelectAll: boolean): boolean {
          const { productionSetting } = globalStore
          if (isSelectAll) {
            return true
          }

          if (isPack) {
            return (
              productionSetting.task_output_source_pack ===
              ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
            )
          }

          return (
            productionSetting.task_output_source ===
              ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS &&
            productionSetting.task_output_source_combination ===
              ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
          )
        },
      },
      {
        children: <BatchActionDefault>{t('标记完工')}</BatchActionDefault>,
        onAction: (selected: string[], isSelectAll: boolean) =>
          handleBatchActionSelect('mark_finish', selected, isSelectAll),
      },
      {
        children: (params: { selected: string[]; isSelectAll: boolean }) => (
          <div>
            <BatchActionDefault>
              <div
                className='gm-inline-block gm-cursor gm-text-bold'
                onClick={() => store.setDiyPickModal(true)}
              >
                {t('打印领料单')}
              </div>
              <Observer>
                {() => {
                  const { diyPickModal } = store
                  const filter = { ...store.getSearchData(type) }
                  const { selected, isSelectAll } = params
                  return (
                    <Modal
                      key={type}
                      visible={diyPickModal}
                      title='批量打印'
                      onCancel={() => store.setDiyPickModal(false)}
                      footer={null}
                      width={900}
                      bodyStyle={{ paddingTop: 0, height: 450 }}
                      destroyOnClose
                    >
                      <DiyBatchPrint
                        id={type}
                        type={PrintingTemplate_Type.TYPE_MATERIAL}
                        printTypeArray={_.filter(
                          printPickArray,
                          (v) =>
                            ![
                              PRINT_PICK_ENUM.car,
                              PRINT_PICK_ENUM.group,
                            ].includes(v.value),
                        )}
                        defaultPrint={PRINT_PICK_ENUM.merchandise}
                        onCancel={() => store.setDiyPickModal(false)}
                        onOk={({ printData, printId }) => {
                          const query: string = qs.stringify({
                            filter: JSON.stringify(
                              !isSelectAll
                                ? Object.assign(filter, {
                                    task_ids: selected,
                                  })
                                : filter,
                            ),
                            printData: printData,
                            printId,
                          })
                          // url
                          openNewTab(
                            `#/system/template/print_template/material_requisition_template/print?${query}`,
                          )
                          store.setDiyPickModal(false)
                        }}
                        href={(printing_template_id: string) =>
                          `#/system/template/print_template/material_requisition_template/edit?template_id=${printing_template_id}`
                        }
                      />
                    </Modal>
                  )
                }}
              </Observer>
            </BatchActionDefault>
          </div>
        ),
      },
    ]

    if (globalStore.productionSetting.bom_material_replace_type) {
      actions.push({
        children: <BatchActionDefault>{t('物料替换')}</BatchActionDefault>,
        onAction: handleBatchReplaceBom,
      })
    }
    return actions
  }, [hasDeletePermission])

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('计划总数'),
                content: paging?.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <>
          {!isPack ? (
            <PermissionJudge
              permission={Permission.PERMISSION_PRODUCTION_CREATE_PRODUCETASK}
            >
              <Button type='primary' onClick={handleCreate}>
                {t('新建生产计划')}
              </Button>
            </PermissionJudge>
          ) : (
            <PermissionJudge
              permission={Permission.PERMISSION_PRODUCTION_CREATE_PACKTASK}
            >
              <Button type='primary' onClick={handleCreate}>
                {t('新建包装计划')}
              </Button>
            </PermissionJudge>
          )}
        </>
      }
    >
      <Table
        id='produce_stock_in_list'
        data={taskList.slice()}
        keyField='task_id'
        isBatchSelect
        isDiy
        fixedSelect
        selected={selected}
        onSelect={(selected) => handleSelect(selected)}
        columns={columns}
        loading={!!loading}
        batchActions={batchActions}
        isSelectorDisable={(item: TaskInfo) =>
          item.state === Task_State.STATE_VOID
        }
      />
      <Observer>
        {() => (
          <ReplaceBomDrawer
            type={type}
            visible={drawerVisible}
            selected={selected}
            onClose={handleDrawerClose}
          />
        )}
      </Observer>
    </BoxTable>
  )
})

export default List
