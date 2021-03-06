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
  const TASK_TEXT = type ? t('??????') : t('??????')
  const TASK_UNIT_TYPE = type ? t('(????????????)') : t('(????????????)')
  const { taskList, loading, paging } = store
  const isPack = type === Task_Type.TYPE_PACK
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  /**
   * ?????????????????????24?????????????????????BOM
   * @param  {string}         key         ?????????????????????
   * @param  {string[]}       selected    ?????????????????????
   * @param  {boolean}        isSelectAll ??????????????????????????????
   * @return {Promise<Bom[]>}             ???????????????BOM?????????
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
        // ??????????????????????????????
        if (!taskDetail.task || !taskDetail.task.task_id) {
          return false
        }
        // ?????????????????????
        if (selected.indexOf(taskDetail.task.task_id) === -1) {
          return false
        }
        // ?????????????????????
        if (taskDetail.task.state === Task_State.STATE_PREPARE) {
          return false
        }
        // ????????????????????????
        if (isPack) {
          return true
        }
        // ?????????????????????????????????????????????????????????
        if (isSingleAutoOutput) {
          return taskDetail.task.type !== Task_Type.TYPE_PRODUCE_CLEANFOOD
        }
        // ?????????????????????????????????????????????????????????
        if (isComboAutoOutput) {
          return taskDetail.task.type !== Task_Type.TYPE_PRODUCE
        }
        // ??????????????????????????????????????????
        return true
      }) || []
    ).map((task) => ({ ...task.task } as Task))

    store.getOutputTaskList(selectedTasks, type === Task_Type.TYPE_PACK)
    RightSideModal.render({
      title: t('??????'),
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
        Header: t('????????????'),
        accessor: 'create_time',
        minWidth: 80,
        fixed: 'left',
        Cell: ({ original }) => {
          const { create_time } = original
          return moment(new Date(+create_time)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('????????????'),
        accessor: 'delivery_time',
        minWidth: 80,
        fixed: 'left',
        Cell: ({ original }) => {
          const { delivery_time } = original
          return moment(new Date(+delivery_time)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('????????????'),
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
        Header: t(`${isPack ? '??????' : '??????'}??????`),
        accessor: 'sku_name',
        diyEnable: false,
        width: 170,
        Cell: ({ original }) => {
          const { sku_name } = original
          return <EllipsesText text={sku_name} />
        },
      },
      {
        Header: t('BOM??????'),
        accessor: 'bom_name',
        width: 170,
        Cell: ({ original }) => {
          const { bom_name } = original
          return <EllipsesText text={bom_name} />
        },
      },
      {
        Header: t('BOM??????'),
        accessor: 'bom_type',
        minWidth: 80,
        Cell: ({ original }) => {
          const { type } = original
          return map_BomType[type]
        },
      },
      {
        Header: t('????????????'),
        accessor: 'sku_type',
        minWidth: 80,
        Cell: ({ original }) => {
          const { sku_type } = original
          return map_Sku_NotPackageSubSkuType[sku_type] || '-'
        },
      },
      {
        Header: t('??????'),
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
        Header: t('????????????'),
        accessor: 'target_customer_id',
        width: 170,
        Cell: ({ original }) => {
          const { customer_name } = original
          return <EllipsesText text={customer_name || '-'} />
        },
      },
      {
        Header: t('????????????'),
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
                <span>{t('?????????')}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
            tip={
              <>
                {t('1.????????????????????????=????????????')}
                <br />
                {t('2.??????????????????????????????=???????????????????????????')}
              </>
            }
          />
        ),
        diyItemText: t('?????????'),
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
      //       header={t('??????')}
      //       info={t('????????????????????????????????????????????????')}
      //       desc={TASK_UNIT_TYPE}
      //     />
      //   ),
      //   diyItemText: t('??????'),
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
      //       header={t(`??????${TASK_TEXT}`)}
      //       desc={TASK_UNIT_TYPE}
      //       info={t(
      //         `??????${TASK_TEXT}=?????????-??????????????????????????????????????????????????????????????????0????????????${TASK_TEXT}=?????????????????????${TASK_TEXT}?????????0????????????${TASK_TEXT}?????????????????????`,
      //       )}
      //       tipStyle={{ width: '320px' }}
      //       right
      //     />
      //   ),
      //   diyItemText: t(`??????${TASK_TEXT}`),
      //   accessor: 'suggest_amount',
      //   width: 110,
      //   Cell: () => {
      //     // ????????????????????????????????????-
      //     return <div>-</div>
      //   },
      // },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{t(`??????${TASK_TEXT}`)}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
            tip={<PlanAmountInfo type={type} />}
          />
        ),
        diyItemText: t(`??????${TASK_TEXT}`),
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
                <span>{t(`???${TASK_TEXT}`)}</span>
                <span>{TASK_UNIT_TYPE}</span>
              </Flex>
            }
          />
        ),
        accessor: 'output_amount',
        minWidth: 80,
        diyItemText: t(`???${TASK_TEXT}`),
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
            header={t('????????????')}
            tip={t(`????????????=???${TASK_TEXT}???/??????${TASK_TEXT}???`)}
          />
        ),
        diyItemText: t('????????????'),
        accessor: 'task_schedule',
        minWidth: 120,
        Cell: ({ index }) => {
          return <CellTaskSchedule index={index} />
        },
      },
      // {
      //   Header: t('????????????'),
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
      //     return <div>{batch || t('?????????')}</div>
      //   },
      // },
      // {
      //   Header: t('????????????'),
      //   accessor: 'source',
      //   width: 80,
      //   Cell: (cellProps: { row: { original: TaskInfo } }) => {
      //     return (
      //       <div>
      //         {cellProps.row.original.source === Task_Source.SOURCE_PLAN
      //           ? !is_pack
      //             ? t('???????????????')
      //             : t('???????????????')
      //           : map_Task_Source[cellProps.row.original.source!]}
      //       </div>
      //     )
      //   },
      // },
      {
        Header: t('????????????'),
        accessor: 'state',
        minWidth: 80,
        Cell: ({ original }) => {
          const { state } = original
          return <div>{map_Task_State[state]}</div>
        },
      },
      {
        Header: t('????????????'),
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
        Header: t(`${TASK_TEXT}??????`),
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
        diyItemText: t('??????'),
        diyEnable: false,
        Cell: ({ index, original }) => {
          return (
            <Observer>
              {() => {
                const { state } = original
                // ???????????????????????????????????????????????????????????????
                return (
                  <Flex style={{ gap: '8px' }}>
                    {state === Task_State.STATE_PREPARE && (
                      <Action index={index} editDisabled={!hasEditPermission} />
                    )}
                    {(state === Task_State.STATE_PREPARE ||
                      state === Task_State.STATE_STARTED) &&
                      hasDeletePermission && (
                        <OperationDelete
                          title={t('?????????????????????')}
                          onClick={() => handleInvalidate(index)}
                        >
                          {t(
                            '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
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
      message.warning(t('????????????????????????????????????????????????'))
      return
    }

    const unfinishedTaskIds = store.taskList
      .filter((task) => task.state !== Task_State.STATE_FINISHED)
      .map((task) => task.task_id)

    selected = selected.filter((taskId) => unfinishedTaskIds.includes(taskId))

    if (!selected.length) {
      message.error('??????????????????/???????????????????????????')
      return
    }

    setSelected(selected)
    setDrawerVisible(true)
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false)
    setSelected([])
  }

  // ????????????????????????????????????
  const batchActions = useMemo(() => {
    const actions = [
      {
        children: <BatchActionDefault>{t('????????????')}</BatchActionDefault>,
        onAction: (selected: string[], isSelectAll: boolean) =>
          handleBatchActionSelect('order_plan', selected, isSelectAll),
      },
      // ???????????? -- ?????????????????????????????????????????????????????????????????????
      {
        children: <BatchActionDefault>{t('??????')}</BatchActionDefault>,
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
        children: <BatchActionDefault>{t('????????????')}</BatchActionDefault>,
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
                {t('???????????????')}
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
                      title='????????????'
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
        children: <BatchActionDefault>{t('????????????')}</BatchActionDefault>,
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
                label: t('????????????'),
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
                {t('??????????????????')}
              </Button>
            </PermissionJudge>
          ) : (
            <PermissionJudge
              permission={Permission.PERMISSION_PRODUCTION_CREATE_PACKTASK}
            >
              <Button type='primary' onClick={handleCreate}>
                {t('??????????????????')}
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
