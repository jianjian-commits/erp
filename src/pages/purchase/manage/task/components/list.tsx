import React, { useState } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  RightSideModal,
  Flex,
  Tip,
  Confirm,
  Modal,
  BoxTableProps,
  Select,
} from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import {
  message,
  Modal as AntdModal,
  Space,
  Button as AntdBottom,
  Drawer,
  Select as AntdSelect,
} from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { is } from '@gm-common/tool'
import qs from 'query-string'
import { observer, Observer } from 'mobx-react'
import moment from 'moment'
import { gmHistory as history } from '@gm-common/router'
import TableTotalText from '@/common/components/table_total_text'
import GoodDetail from './good_detail'
import Progress from './progress'
import Operation from './operation'
import HeaderTip from '@/common/components/header_tip'
import SupplierSelector from '../../components/supplier_selector'
import PurchaserSelector from '../../components/purchaser_selector'
import PurchaserBatch from './purchase_batch'
import SupplierBatch from './supplier_batch'
import SidePrintModal from '../../components/side_print_modal'
import CombinePurchaseTask from './combine_purchase_task'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import {
  PurchaseTask_RequestSource,
  map_PurchaseTask_Status,
  UpdatePurchaseTask,
  PurchaseTask_Status,
  AsyncReleasePurchaseTask,
  AsyncSwitchPurchaseTaskPurchaser,
  AsyncSwitchPurchaseTaskSupplier,
  PurchaseTask_Type,
  AsyncReleasePurchaseTaskRequest,
  AsyncSwitchPurchaseTaskPurchaserRequest,
  AsyncSwitchPurchaseTaskSupplierRequest,
  AsyncAdjustTaskPlanValueByStock,
  AsyncAdjustTaskPlanValueByStockRequest,
  AdjustTaskPlanValueByStock,
  ReleasePurchaseTask,
} from 'gm_api/src/purchase'
import {
  purchaserGroupBy,
  list2Map,
  getTaskParams,
} from '@/pages/purchase/util'
import store, { Task } from '../store'
import globalStore from '@/stores/global'
import PlanValue from './plan_value'
import Remark from './remark'
import BaseStock from './base_stock'
import { toFixed, openNewTab } from '@/common/util'
import { GroupUser, Supplier, Permission } from 'gm_api/src/enterprise'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import PermissionJudge from '@/common/components/permission_judge'
import BatchReductionReceipt from '@/pages/purchase/manage/task/components/batch_reduction_receipt'
import ReleaseAndGeratePurchase from '@/pages/purchase/manage/task/components/release_and_generate_purchase'
import { CooperateModelMapType } from '../interface'
import BatchActionBarComponent from '@/common/components/batch_action_bar'

const CooperateModelMap: CooperateModelMapType = {
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('?????????'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('?????????'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('?????????'),
}
/** * @description ?????????????????? */
const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const [isCombinePurchase, setIsCombinePurchase] = useState(false)
  const [deliveryRatio, setDeliveryRatio] = useState(false)
  const [index, setIndex] = useState(0)

  const {
    list,
    paging,
    selected,
    isSelectAll,
    drawerVisible,
    setSelected,
    setIsSelectAll,
    processCombine,
    setSelectPurchaseTask,
    setDrawerVisible,
  } = store
  // ??????????????????
  const handlePopupGoodDetail = (index: number) => {
    setIndex(index)
    setDrawerVisible(true)
  }

  const handleChange = <T extends keyof Task>(
    index: number,
    key: T,
    value: Task[T],
  ) => {
    store.rowUpdate(index, key, value)
  }

  // ???????????????
  const handleSupplierChange = (index: number, value: Task['supplier']) => {
    handleChange(index, 'supplier', value)
  }

  /** @description ?????????????????? */
  const handleLevelChange = (index: number, value: string) => {
    handleChange(index, 'sku_level_filed_id', value === undefined ? '0' : value)
  }

  /** @description ???????????? */
  const renderTask = () => {
    globalStore.showTaskPanel('1')
  }

  /** @description list????????? */
  const handleSelect = (selected: string[]) => {
    setSelected(selected)
  }

  /**  @description ???????????? */
  const handleCancelSelect = () => {
    setSelected([])
    setIsSelectAll(false)
  }

  /** @description ???????????? */
  const handleToggleSelectAll = (params: boolean) => {
    setIsSelectAll(params)
    setSelected(_.map(list, (item) => item.purchase_task_id))
  }

  /** @description ?????????????????? */
  const handleBatchDeduction = () => {
    Confirm({
      title: '??????????????????',
      size: 'md',
      children: <BatchReductionReceipt />,
      read: t('?????????????????????????????????????????????'),
    }).then(async () => {
      if (isSelectAll) {
        await AsyncAdjustTaskPlanValueByStock({
          ...(store.getTaskParams() as AsyncAdjustTaskPlanValueByStockRequest),
        })
        renderTask()
      } else {
        const map = list2Map(list.slice(), 'purchase_task_id')
        const tasks = selected
          .map((id) => map[id])
          .filter(
            (v) =>
              v &&
              (v.status & PurchaseTask_Status.PREPARE) ===
                PurchaseTask_Status.PREPARE,
          )
          .map((t) => {
            return {
              ...getTaskParams(t),
            }
          })
        if (!tasks.length) {
          Tip.danger(t('????????????????????????????????????'))
          return
        }
        await AdjustTaskPlanValueByStock({
          purchase_tasks: tasks,
        })
        Tip.success(t('????????????????????????'))
        store.doRequest()
      }
      return null
    })
  }

  /** @description ???????????????????????? */
  const handleCreatePurchaseBill = () => {
    Confirm({
      title: '????????????????????????',
      size: 'md',
      children: <ReleaseAndGeratePurchase />,
    }).then(
      async () => {
        if (isSelectAll) {
          await AsyncReleasePurchaseTask({
            ...(store.getTaskParams() as AsyncReleasePurchaseTaskRequest),
          })
          renderTask()
        } else {
          const map = list2Map(list.slice(), 'purchase_task_id')
          const tasks = selected
            .map((id) => map[id])
            .filter((v) => {
              return (
                v &&
                (v.status & PurchaseTask_Status.PREPARE) ===
                  PurchaseTask_Status.PREPARE &&
                (v.supplier || v.purchaser)
              )
            })
            .map((t) => {
              return {
                ...getTaskParams(t),
              }
            })
          if (!tasks.length) {
            Tip.danger(
              t('??????????????????????????????????????????????????????????????????????????????'),
            )
            return
          }

          await ReleasePurchaseTask({
            purchase_tasks: tasks,
          })
          if (tasks.length !== selected.length) {
            Tip.success(t('???????????????????????????????????????????????????'))
          } else {
            Tip.success('??????????????????????????????')
          }
          store.doRequest()
        }
        return null
      },
      (_) => _,
    )
  }

  /** @description ????????????????????? */
  const handleAmendPurchaser = () => {
    Modal.render({
      children: (
        <PurchaserBatch
          selected={selected}
          isSelectedAll={isSelectAll}
          onOK={(p: GroupUser) => {
            if (isSelectAll) {
              AsyncSwitchPurchaseTaskPurchaser({
                ...(store.getTaskParams() as AsyncSwitchPurchaseTaskPurchaserRequest),
                new_purchaser_id: p?.group_user_id,
              }).then(() => {
                renderTask()
                return null
              })
            } else {
              const map = list2Map(store.list.slice(), 'purchase_task_id')
              const tasks = selected
                .map((id) => map[id])
                .filter((v) => +v.status === +PurchaseTask_Status.PREPARE)
                .map((t) => {
                  return {
                    ...getTaskParams(t),
                    purchaser_id: p?.group_user_id,
                  }
                })
              if (!tasks.length) {
                Tip.danger('??????????????????????????????????????????')
                return
              }

              UpdatePurchaseTask({ purchase_tasks: tasks }).then(() => {
                Tip.success('??????????????????????????????')
                store.doRequest()
                return null
              })
            }
          }}
        />
      ),
      title: t('??????'),
      size: 'sm',
      onHide: Modal.hide,
    })
  }

  /** @description ????????????????????? */
  const handleAmendSupplier = () => {
    Modal.render({
      children: (
        <SupplierBatch
          selected={selected}
          isSelectedAll={isSelectAll}
          onOK={(s: Supplier) => {
            if (isSelectAll) {
              AsyncSwitchPurchaseTaskSupplier({
                ...(store.getTaskParams() as AsyncSwitchPurchaseTaskSupplierRequest),
                new_supplier_id: s?.supplier_id,
              }).then(() => {
                renderTask()
                return null
              })
            } else {
              const map = list2Map(store.list.slice(), 'purchase_task_id')
              const tasks = selected
                .map((id) => map[id])
                .filter(
                  (v) =>
                    v &&
                    (v.status & PurchaseTask_Status.PREPARE) ===
                      PurchaseTask_Status.PREPARE,
                )
                .map((t) => {
                  return {
                    ...getTaskParams(t),
                    supplier_id: s?.supplier_id,
                  }
                })
              if (!tasks.length) {
                Tip.danger('??????????????????????????????????????????')
                return
              }
              UpdatePurchaseTask({ purchase_tasks: tasks }).then(() => {
                Tip.success('??????????????????????????????')
                store.doRequest()
                return null
              })
            }
          }}
        />
      ),
      title: t('??????'),
      size: 'sm',
      onHide: Modal.hide,
    })
  }

  /** @description ???????????????????????? */
  const handleBatchPrint = async () => {
    const templates = await ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_PURCHASE_TASK,
    }).then((json) => json.response.printing_templates || [])
    const params = isSelectAll
      ? { ...store.getTaskParams(), limit: 0, all: true }
      : {
          purchase_task_ids: selected,
          type: PurchaseTask_Type.COMMON,
          category_ids: [] as string[],
          supplier_ids: [] as string[],
          purchaser_ids: [] as string[],
          limit: 999,
          begin_time: `${+store.filter.begin}`,
          end_time: `${+store.filter.end}`,
        }
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <SidePrintModal
          name='purchase_task_print'
          onPrint={({ printing_template_id }) => {
            const qsData = {
              tpl_id: printing_template_id,
              print_what: 'task',
              ...params,
            }
            openNewTab(
              `#system/template/print_template/purchase_task_template/print?${qs.stringify(
                qsData as any,
              )}`,
            )
            RightSideModal.hide()
          }}
          templates={templates}
        />
      ),
    })
  }

  /** @description  ?????????????????? */
  const handleCombinePurchase = () => {
    // ???????????? ?????????????????????,?????????????????????
    if (selected.length <= 1) {
      message.error(t('??????????????????????????????2??????????????????????????????'))
    } else {
      // ????????????
      const purchaseTaskList: Task[] = []

      // ?????????????????????????????????????????????
      const filterList = list.filter(
        (item) => item.status === PurchaseTask_Status.PREPARE,
      )

      // ????????????????????????id??????
      const purchaseList = _.groupBy(filterList || [], 'purchase_task_id')

      // ????????????select???????????????????????????
      selected.map((item) => {
        if (purchaseList?.[item]) {
          purchaseTaskList.push(...purchaseList?.[item])
        }
      })

      if (purchaseTaskList.length === 0) {
        message.error(t('????????????????????????????????????????????????'))
        return false
      }

      setSelectPurchaseTask(purchaseTaskList)
      processCombine()
      // ??????????????????????????????????????????
      setIsCombinePurchase(true)
    }
  }

  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <Flex alignCenter className='tw-pb-2'>
            <BoxTableInfo>
              <Observer>
                {() => (
                  <TableTotalText
                    data={[
                      { label: t('????????????'), content: store.paging.count },
                    ]}
                  />
                )}
              </Observer>
            </BoxTableInfo>
            <Space size='middle' className='tw-ml-3'>
              <AntdBottom disabled>{t('??????????????????')}</AntdBottom>
              <AntdBottom disabled>{t('????????????????????????')}</AntdBottom>
              <PermissionJudge
                permission={Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_TASK}
              >
                <AntdBottom disabled>{t('?????????????????????')}</AntdBottom>
              </PermissionJudge>
              <PermissionJudge
                permission={Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_TASK}
              >
                <AntdBottom disabled>{t('?????????????????????')}</AntdBottom>
              </PermissionJudge>
              <AntdBottom disabled>{t('????????????????????????')}</AntdBottom>
              <PermissionJudge
                permission={Permission.PERMISSION_PURCHASE_MERGE_PURCHASE_TASK}
              >
                <AntdBottom disabled>{t('??????????????????')}</AntdBottom>
              </PermissionJudge>
            </Space>
          </Flex>
        }
        action={
          <div className='tw-pb-2'>
            <PermissionJudge
              permission={Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_TASK}
            >
              <AntdBottom
                type='primary'
                onClick={() => {
                  history.push('/purchase/manage/task/create_specs')
                }}
              >
                {t('??????????????????')}
              </AntdBottom>
            </PermissionJudge>
          </div>
        }
      >
        <Table<Task>
          isDiy
          // isBatchSelect
          id='purchaseTask'
          isSelect
          onSelect={handleSelect}
          selected={selected.slice()}
          data={list}
          keyField='purchase_task_id'
          fixedSelect
          loading={!!store.loading}
          columns={[
            {
              Header: t('????????????'),
              id: 'create_time',
              minWidth: 140,
              accessor: (d) => (
                <>
                  {moment(new Date(+d.create_time!)).format('YYYY-MM-DD HH:mm')}
                </>
              ),
            },
            {
              Header: t('????????????'),
              id: 'purchase_time',
              minWidth: 140,
              accessor: (d) => (
                <>
                  {moment(new Date(+d.purchase_time!)).format(
                    'YYYY-MM-DD HH:mm',
                  )}
                </>
              ),
            },
            {
              Header: t('????????????'),
              accessor: 'serial_no',
              minWidth: 160,
              Cell: (props) => {
                return (
                  <div>
                    <a
                      className='gm-text-primary gm-cursor'
                      onClick={handlePopupGoodDetail.bind(null, props.index)}
                    >
                      {props.original.serial_no}
                    </a>
                  </div>
                )
              },
            },
            {
              Header: t('??????'),
              id: 'sku',
              minWidth: 120,
              accessor: (d) => d.sku?.name || '-',
            },
            {
              Header: t('??????'),
              id: 'category_name',
              minWidth: 140,
              accessor: (d) => d?.category_name || '-',
            },
            {
              Header: t('????????????'),
              id: 'sku_level_filed_id',
              minWidth: 140,
              Cell: (props) => {
                return (
                  <Observer>
                    {() => {
                      const {
                        isEditing,
                        sku_level_filed_id,
                        sku_level_name,
                        status,
                        levelData,
                      } = props.original
                      if (isEditing && status < PurchaseTask_Status.RELEASED) {
                        const selectData = levelData.filter((i) => !i.is_delete)
                        const index = _.findIndex(
                          selectData,
                          (i) => i.level_id === sku_level_filed_id,
                        )
                        if (sku_level_filed_id !== '0' && index === -1) {
                          const disableData = _.find(
                            levelData,
                            (i) => i.level_id === sku_level_filed_id,
                          )
                          selectData.push({
                            ...disableData!,
                            disable: true,
                            text: disableData?.text!,
                            label: disableData?.text!,
                          })
                        }
                        return (
                          <AntdSelect
                            options={selectData || []}
                            value={
                              sku_level_filed_id === '0'
                                ? undefined
                                : sku_level_filed_id
                            }
                            placeholder={t('??????????????????')}
                            allowClear
                            onChange={(value: string) =>
                              handleLevelChange(props.index, value)
                            }
                          />
                        )
                      }
                      return <>{sku_level_name}</>
                    }}
                  </Observer>
                )
              },
            },
            {
              Header: t('?????????'),
              accessor: 'supplier',
              minWidth: 140,
              Cell: (props) => (
                <Observer>
                  {() => {
                    const { isEditing, supplier, status } = props.original
                    if (isEditing && status < PurchaseTask_Status.RELEASED) {
                      return (
                        <SupplierSelector
                          multiple={false}
                          selected={
                            supplier && {
                              ...supplier,
                              value: supplier.supplier_id,
                              text: supplier.name,
                            }
                          }
                          onSelect={handleSupplierChange.bind(
                            null,
                            props.index,
                          )}
                        />
                      )
                    }
                    return supplier?.name || '-'
                  }}
                </Observer>
              ),
            },
            {
              Header: t('????????????(????????????)'),
              accessor: 'upperLimiit',
              minWidth: 140,
              Cell: (props) => (
                <Observer>
                  {() => {
                    const { upperLimiit, unit_name } = props.original
                    return <>{upperLimiit ? upperLimiit + unit_name : '-'}</>
                  }}
                </Observer>
              ),
            },
            {
              Header: t('?????????????????????'),
              accessor: 'supplier_cooperate_model_type',
              minWidth: 140,
              Cell: (props) => (
                <Observer>
                  {() => {
                    const { isEditing, supplier_cooperate_model_type } =
                      props.original
                    const request_details =
                      props.original.request_details.request_details
                    if (isEditing) {
                      const fromOrder =
                        request_details.length > 0 &&
                        request_details.filter(
                          (v) =>
                            v.request_source &&
                            v.request_source ===
                              PurchaseTask_RequestSource.ORDER,
                        ).length === request_details.length
                      return (
                        <Select
                          data={[
                            {
                              value:
                                Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
                              text: t('?????????'),
                            },
                            {
                              value:
                                Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
                              text: t('?????????'),
                            },
                            {
                              value:
                                Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
                              text: t('?????????'),
                            },
                          ]}
                          disabled={!fromOrder}
                          value={supplier_cooperate_model_type}
                          onChange={handleChange.bind(
                            null,
                            props.index,
                            'supplier_cooperate_model_type',
                          )}
                        />
                      )
                    }
                    return (
                      <div>
                        {
                          CooperateModelMap[
                            supplier_cooperate_model_type ||
                              Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
                          ]
                        }
                      </div>
                    )
                  }}
                </Observer>
              ),
            },
            {
              Header: t('?????????'),
              accessor: 'purchaser',
              minWidth: 140,
              Cell: (props) => (
                <Observer>
                  {() => {
                    const { isEditing, purchaser, supplier } = props.original
                    if (isEditing) {
                      return (
                        <PurchaserSelector
                          groupBy={(list) => purchaserGroupBy(list, supplier)}
                          selected={
                            purchaser && {
                              ...purchaser,
                              value: purchaser.group_user_id,
                              text: purchaser.name,
                            }
                          }
                          onSelect={handleChange.bind(
                            null,
                            props.index,
                            'purchaser',
                          )}
                        />
                      )
                    }
                    return purchaser?.name || '-'
                  }}
                </Observer>
              ),
            },
            {
              Header: (
                <HeaderTip
                  header={t('?????????(????????????)')}
                  tip={
                    <Flex column>
                      <div>{t('1.????????????????????????=?????????')}</div>
                      <div>{t('2.??????????????????????????????=????????????????????????')}</div>
                      <div>
                        {t(
                          '3.??????????????????????????????=?????????????????????BOM?????????????????????',
                        )}
                      </div>
                    </Flex>
                  }
                />
              ),
              diyItemText: t('?????????(????????????)'),
              id: 'request_details',
              minWidth: 140,
              accessor: (d) => {
                const { rate, unit_name } = d
                return (
                  (d?.request_value?.input?.quantity
                    ? toFixed(Big(d?.request_value?.input?.quantity).div(+rate))
                    : '-') + unit_name
                )
              },
            },
            {
              Header: t('????????????(????????????)'),
              accessor: 'plan_value',
              minWidth: 140,
              Cell: (props) => (
                <Observer>
                  {() => {
                    const { supplier_cooperate_model_type } = props.original
                    const disabled =
                      supplier_cooperate_model_type ===
                        Sku_SupplierCooperateModelType.SCMT_WITH_SORTING ||
                      supplier_cooperate_model_type ===
                        Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY
                    return <PlanValue index={props.index} disabled={disabled} />
                  }}
                </Observer>
              ),
            },
            {
              Header: t('?????????(????????????)'),
              id: 'purchase_value',
              accessor: 'purchase_value',
              minWidth: 140,
              Cell: (props) => {
                const { purchase_value, rate, unit_name } = props.original
                const value = purchase_value?.input?.quantity
                  ? toFixed(
                      Big(purchase_value?.input?.quantity || 0).div(+rate),
                    )
                  : '-'
                return value + unit_name
              },
            },
            {
              Header: (
                <HeaderTip
                  header={t('??????(????????????)')}
                  tip={t('????????????????????????????????????????????????')}
                />
              ),
              diyItemText: t('??????(????????????)'),
              id: 'base_stock',
              minWidth: 140,
              accessor: 'base_stock',
              Cell: (props) => <BaseStock index={props.index} />,
            },
            {
              Header: t('????????????'),
              id: 'batch',
              minWidth: 80,
              accessor: (d) => d?.batch?.name || '-',
            },
            {
              Header: t('????????????'),
              id: 'plan_value_process',
              minWidth: 200,
              Cell: (props) => <Progress index={props.index} />,
            },
            {
              Header: t('??????'),
              id: 'status',
              minWidth: 80,
              accessor: (d) => map_PurchaseTask_Status[d.status] || '-',
            },
            {
              Header: t('????????????'),
              id: 'release_time',
              minWidth: 140,
              accessor: (d) =>
                +d.release_time!
                  ? moment(new Date(+d.release_time!)).format(
                      'YYYY-MM-DD HH:mm',
                    )
                  : '-',
            },
            {
              Header: t('??????'),
              id: 'remark',
              minWidth: 140,
              accessor: 'remark',
              Cell: (props: { row: { original: any; index: number } }) => (
                <Observer>{() => <Remark index={props.row.index} />}</Observer>
              ),
            },
            {
              Header: <Flex justifyCenter>{t('??????')}</Flex>,
              id: 'action',
              accessor: 'op',
              fixed: 'right',
              width: 140,
              Cell: (props) => <Operation index={props.index} />,
            },
          ]}
          batchActionBar={
            selected.length > 0 && (
              <BatchActionBarComponent
                className='tw-h-12'
                selected={selected}
                onClose={handleCancelSelect}
                isSelectAll={isSelectAll}
                toggleSelectAll={handleToggleSelectAll}
                count={isSelectAll ? +paging.count! : selected.length}
                ButtonNode={
                  <Space size='middle'>
                    <AntdBottom onClick={handleBatchDeduction}>
                      {t('??????????????????')}
                    </AntdBottom>
                    <AntdBottom onClick={handleCreatePurchaseBill}>
                      {t('????????????????????????')}
                    </AntdBottom>
                    <PermissionJudge
                      permission={
                        Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_TASK
                      }
                    >
                      <AntdBottom onClick={handleAmendPurchaser}>
                        {t('?????????????????????')}
                      </AntdBottom>
                    </PermissionJudge>
                    <PermissionJudge
                      permission={
                        Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_TASK
                      }
                    >
                      <AntdBottom onClick={handleAmendSupplier}>
                        {t('?????????????????????')}
                      </AntdBottom>
                    </PermissionJudge>
                    <AntdBottom onClick={handleBatchPrint}>
                      {t('????????????????????????')}
                    </AntdBottom>
                    <PermissionJudge
                      permission={
                        Permission.PERMISSION_PURCHASE_MERGE_PURCHASE_TASK
                      }
                    >
                      <AntdBottom
                        onClick={handleCombinePurchase}
                        disabled={isSelectAll}
                      >
                        {t('??????????????????')}
                      </AntdBottom>
                    </PermissionJudge>
                  </Space>
                }
              />
            )
          }
        />
        {isCombinePurchase && (
          <CombinePurchaseTask
            visible={isCombinePurchase}
            handleVisible={() => setIsCombinePurchase(false)}
          />
        )}

        <AntdModal
          destroyOnClose
          visible={deliveryRatio}
          title={t('?????????????????????')}
          onCancel={() => setDeliveryRatio(false)}
          onOk={() => {
            setDeliveryRatio(false)
          }}
        >
          <>
            <p>{t('?????????????????????????????????????????????????????????????????????')}</p>
            <p>
              {t(`??????${'5'}?????????,???${'2'}?????????????????????????????????`)}
              <a>{t('??????????????????')}</a>
            </p>
          </>
        </AntdModal>
      </BoxTable>
      <Drawer
        bodyStyle={{ padding: 0, fontSize: '12px' }}
        headerStyle={{
          height: '0px',
          padding: 0,
          paddingTop: '10px',
        }}
        className='purchase_task_drawer'
        closeIcon={
          <Flex justifyEnd alignCenter>
            <CloseOutlined />
          </Flex>
        }
        width={is.phone() ? '100vw' : '900px'}
        style={is.phone() ? { overflow: 'auto' } : { overflowY: 'auto' }}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <GoodDetail index={index} />
      </Drawer>
    </>
  )
}

export default observer(List)
