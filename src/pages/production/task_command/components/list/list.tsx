import HeaderTip from '@/common/components/header_tip'
import TableTotalText from '@/common/components/table_total_text'
import { openNewTab } from '@/common/util'
import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import DiyBatchPrint from '@/pages/production/components/diy_batch_print'
import { descTest, headTest, toFixed } from '@/pages/production/util'
import { MergeType } from '@/pages/system/template/print_template/production_template/interface'
import globalStore from '@/stores/global'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Flex,
  ProgressCircle,
  RightSideModal,
} from '@gm-pc/react'
import { BatchActionDefault, Column, Table } from '@gm-pc/table-x'
import { Modal, Tag } from 'antd'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  PrintingTemplate_TemplateProductionType,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { map_ProcessTask_State, ProduceType } from 'gm_api/src/production'
import { toJS } from 'mobx'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import qs from 'query-string'
import React, { FC, useMemo } from 'react'
import TaskDetail from '../../../task_command_detail'
import {
  AMOUT_TYPE,
  mergeTypeArray,
  printPickArray,
  printTypeArray,
  PRINT_COMMAND_VAlUE,
  PRINT_PICK_ENUM,
  SHOW_OVERFLOW,
  TRANSFORM_PRODUCT_PRINT_TYPE,
} from '../../enum'
import type { MapProcessTaskDetail } from '../../interface'
import store from '../../store'
import MaterialName from './components/material_name'
import Operation from './components/operation'
import PackAmount from './components/pack_amount'
import ProductionAmount from './components/production_amount'
import SelectProcessor from './components/select_processor'
import SubTableChild from './components/sub_table'

interface Props extends Pick<BoxTableProps, 'pagination'> {
  type?: ProduceType
}

const List: FC<Props> = ({ type, pagination }) => {
  const isPack = type === ProduceType.PRODUCE_TYPE_PACK
  const { list, paging } = store

  const commandInfo =
    type === ProduceType.PRODUCE_TYPE_DELICATESSEN
      ? t('???????????????????????????????????????????????????????????????????????????')
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
  const column: Column<MapProcessTaskDetail>[] = useMemo(
    () => [
      {
        Header: t('????????????'),
        accessor: 'create_time',
        minWidth: 140,
        Cell: (cellProps) => {
          const { create_time } = cellProps.original.process_task!!
          return moment(new Date(+create_time!)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('????????????'),
        accessor: 'delivery_times',
        minWidth: 160,
        Cell: (cellProps) => {
          console.log(toJS(cellProps.original))
          const { delivery_times } = cellProps.original.process_task
          const allTime =
            delivery_times
              ?.split(',')
              .reduce((allTime, time) => {
                allTime.push(time)
                return allTime
              }, [] as string[])
              .join(', ') || '-'
          return <EllipsesText text={allTime} maxLength={19} />
        },
      },
      {
        Header: t('????????????'),
        accessor: 'serial_no',
        minWidth: 140,
        Cell: (cellProps) => {
          const { processor, process_task } = cellProps.original
          const { process_task_id, serial_no, inputs } = process_task
          const is_combine = inputs!.inputs!.length >= 2
          return (
            <span>
              {!isPack && processor === '0' && (
                <Tag color='blue'>???????????????</Tag>
              )}
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
        Header: t('??????'),
        accessor: 'process',
        hide: isPack,
        width: 120,
        Cell: (cellProps) => {
          const { process_name } = cellProps.original.process_task!
          return process_name
        },
      },
      {
        Header: t('????????????'),
        accessor: 'process_name',
        hide: isPack,
        width: 170,
        Cell: (cellProps) => {
          const { attrs } = cellProps.original.process_task!
          return (
            <MaterialName
              attrs={attrs!.attrs!}
              nameType={SHOW_OVERFLOW.attrs}
            />
          )
        },
      },
      {
        Header: t(`${isPack ? '??????' : '??????'}??????`),
        accessor: 'outputs_name',
        width: 170,
        Cell: (cellProps) => {
          return (
            <MaterialName
              outputs={cellProps.original.process_task_relations}
              nameType={SHOW_OVERFLOW.output}
            />
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'ingredients',
        width: 170,
        hide: !isPack,
        Cell: (cellProps) => {
          const { raw_inputs } = cellProps.original.process_task!
          return (
            <MaterialName
              match={raw_inputs!.inputs!}
              nameType={SHOW_OVERFLOW.raw_input}
            />
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'inputs_name',
        width: 170,
        Cell: (cellProps) => {
          const { inputs } = cellProps.original.process_task!
          return (
            <MaterialName
              inputs={inputs!.inputs!}
              nameType={SHOW_OVERFLOW.input}
            />
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '??????', '??????')}</span>
                <span>{t('??????????????????')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        accessor: 'inputs_plan',
        minWidth: 140,
        Cell: (cellProps) => {
          const { inputs, main_output } = cellProps.original.process_task!
          const material = inputs!.inputs![0]?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={main_output!.material!}
                  isBaseUnit
                  type={AMOUT_TYPE.plan}
                  ssuInfo={cellProps.original.ssuInfo!}
                  packRate={cellProps.original.packRate}
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
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '??????', '??????')}</span>
                <span>{descTest(isPack, '??????')}</span>
              </Flex>
            }
          />
        ),
        accessor: 'main_plan',
        minWidth: 140,
        Cell: (cellProps) => {
          const { main_output } = cellProps.original.process_task!
          const material = main_output?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.plan}
                  ssuInfo={cellProps.original.ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='plan' />
              )}
            </>
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'processor',
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { edit, processor } = cellProps.original
                return edit ? (
                  <SelectProcessor
                    processor={processor}
                    onChange={(value: string) =>
                      store.updateProcessTaskInfo(
                        cellProps.index,
                        'processor',
                        value,
                      )
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
        Header: t('????????????'),
        accessor: 'target_customer_id',
        minWidth: 140,
        Cell: (cellProps) => {
          const { customerName } = cellProps.original.process_task!
          return <div>{customerName || '-'}</div>
        },
      },
      {
        Header: t('????????????'),
        accessor: 'target_route_id',
        minWidth: 140,
        Cell: (cellProps) => {
          const { routerName } = cellProps.original.process_task!
          return <div>{routerName || '-'}</div>
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '??????', '??????')}</span>
                <span>{t('??????????????????')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        accessor: 'inputs_actual',
        minWidth: 140,
        Cell: (cellProps) => {
          const { inputs, main_output } = cellProps.original.process_task!
          const material = inputs!.inputs![0]?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={main_output!.material!}
                  isBaseUnit
                  type={AMOUT_TYPE.baseUnitActual}
                  ssuInfo={cellProps.original.ssuInfo!}
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
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '??????', '??????')}</span>
                <span>{descTest(isPack, '??????')}</span>
              </Flex>
            }
          />
        ),
        accessor: 'main_actual',
        minWidth: 140,
        Cell: (cellProps) => {
          const { main_output } = cellProps.original.process_task!
          const material = main_output?.material!
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.actual}
                  ssuInfo={cellProps.original.ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='actual' />
              )}
            </>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={t('????????????')}
            tip={t(
              `${
                isPack
                  ? '????????????????????????????????????/????????????????????????????????????*100%'
                  : '??????????????????/??????????????????*100%'
              }`,
            )}
          />
        ),
        accessor: 'main_percent',
        minWidth: 140,
        Cell: (cellProps) => {
          const { ssuInfo, process_task } = cellProps.original
          const { actual_amount, plan_amount, unit_id } =
            process_task!.main_output!.material!
          const unit_name = isPack
            ? ssuInfo?.ssu?.unit.name
            : globalStore.getUnitName(unit_id!)
          return (
            <Flex>
              <ProgressCircle
                percentage={
                  +Big(actual_amount || 0)
                    .div(plan_amount)
                    .times(100)
                    .toFixed(2)
                }
              />
              <div>
                <span>{toFixed(actual_amount || '0') + unit_name}</span>/
                <span>{toFixed(plan_amount || '0') + unit_name}</span>
              </div>
            </Flex>
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'state',
        minWidth: 140,
        Cell: (cellProps) => {
          const { state } = cellProps.original.process_task!
          return map_ProcessTask_State[state!]
        },
      },
      {
        Header: t(
          `${type === ProduceType.PRODUCE_TYPE_PACK ? '??????' : '??????'}??????`,
        ),
        accessor: 'batch',
        minWidth: 80,
        Cell: (cellProps) => {
          return <div>{cellProps.original.process_task.batch || '-'}</div>
        },
      },
      {
        Header: t('??????'),
        accessor: 'operation',
        fixed: 'right',
        minWidth: 140,
        Cell: (cellProps) => {
          const { ssuInfo, process_task } = cellProps.original
          const { unit_id } = process_task!.main_output!.material!
          const unit_name = isPack
            ? ssuInfo?.ssu?.unit.name
            : globalStore.getUnitName(unit_id!)

          return (
            <Operation
              index={cellProps.index}
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
    if (isPack) {
      return [getPrintBatchAction(ProduceType.PRODUCE_TYPE_PACK)]
    } else {
      return [
        getPrintBatchAction(ProduceType.PRODUCE_TYPE_CLEANFOOD),
        getPrintBatchAction(ProduceType.PRODUCE_TYPE_DELICATESSEN),
      ]
    }
  }

  const getPrintBatchAction = (type: ProduceType) => {
    const printTypeText =
      type === ProduceType.PRODUCE_TYPE_CLEANFOOD
        ? '??????'
        : type === ProduceType.PRODUCE_TYPE_DELICATESSEN
        ? '??????'
        : ''
    return {
      children: (params: { selected: string[]; isSelectAll: boolean }) =>
        isPrintActionVisible(type, params.selected, params.isSelectAll) && (
          <div>
            <BatchActionDefault>
              <div
                className='gm-inline-block gm-cursor gm-text-bold'
                onClick={() => store.setShowPrintModal(type, true)}
              >
                {t(`??????${printTypeText}?????????`)}
              </div>
              <Observer>
                {() =>
                  showPrintModal(type, params.selected, params.isSelectAll)
                }
              </Observer>
            </BatchActionDefault>
          </div>
        ),
    }
  }

  const isPrintActionVisible = (
    type: ProduceType,
    selected: string[],
    isSelectAll: boolean,
  ) => {
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
        title='????????????'
        onCancel={() => store.setShowPrintModal(type, false)}
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
          onCancel={() => store.setShowPrintModal(type, false)}
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

  const printPick = (selected: string[], isSelectAll: boolean) => {
    return (
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
            const filter = store.getSearchTaskData(type)
            return (
              <Modal
                visible={diyPickModal}
                title='????????????'
                onCancel={() => store.setDiyPickModal(false)}
                footer={null}
                width={900}
                bodyStyle={{ paddingTop: 0, height: 450 }}
                destroyOnClose
              >
                <DiyBatchPrint
                  id={`isTaskPick${type}`}
                  type={PrintingTemplate_Type.TYPE_MATERIAL}
                  printTypeArray={printPickArray}
                  defaultPrint={PRINT_PICK_ENUM.merchandise}
                  onCancel={() => store.setDiyPickModal(false)}
                  onOk={({ printData, printId }) => {
                    const query: string = qs.stringify({
                      filter: JSON.stringify(
                        !isSelectAll
                          ? Object.assign(filter, {
                              process_task_ids: selected,
                            })
                          : filter,
                      ),
                      printData: printData,
                      printId,
                      isTask: true,
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
    )
  }

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
    >
      <Table
        id='production_process_task_list'
        isBatchSelect
        isExpand
        isDiy
        data={list.slice()}
        columns={column}
        keyField='process_task_id'
        SubComponent={({ index }) => (
          <SubTableChild process_index={index} type={type} />
        )}
        batchActions={[
          ...getPrintBatchActions(),
          {
            children: (params: { selected: string[]; isSelectAll: boolean }) =>
              printPick(params.selected, params.isSelectAll),
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
