import React, { useState } from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Price,
  Button,
  FunctionSet,
  Modal,
  Popover,
  BoxTableProps,
  Confirm,
} from '@gm-pc/react'
import {
  Table,
  TableXUtil,
  BatchActionEdit,
  BatchActionDefault,
  Column,
} from '@gm-pc/table-x'
import { Drawer } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import { gmHistory as history } from '@gm-common/router'
import TableTotalText, {
  TotalTextOptions,
} from '@/common/components/table_total_text'
import {
  ProcessedProductPlan,
  NotProcessedProductPlan,
} from '../../components/product_plan'
import Operation from './operation'
import EditState from './edit_state'
import OrderState from './order_state'
import BatchImport from '../../../components/batch/import'
import store from '../store'
import orderTaskStore from '@/pages/delivery/delivery_task/order_task/store'
import { map_App_Type, App_Type } from 'gm_api/src/common'
import {
  BatchUpdateOrderState,
  BatchSyncSaleOutStockSheetFromOrder,
  BatchSyncPriceToOrder,
  BatchSyncOrderPriceToBasic,
} from 'gm_api/src/orderlogic'
import { OrderInfoViewOrder } from '../interface'
import { Order_State, map_Order_PayState } from 'gm_api/src/order'
import { toFixedOrder, getReceiptStatusText } from '@/common/util'
import { appTypeMap } from '../../../../enum'

import globalStore from '@/stores/global'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { getOrderDetailUrl } from '../../../../util'

import SVGAnomaly from '@/svg/triangle-warning.svg'
import HeaderTip from '@/common/components/header_tip'

import OrderPrintModalNew from '@/pages/delivery/components/order_print_modal_new/order_print_modal_new'

import DrawerTitle from '../../components/product_plan/components/process_drawer_title'
import { BatchActionBarItem } from '@gm-pc/table-x/src/components'
import { openModal } from '@/pages/delivery/delivery_task/order_task/componetns/list'
import syncConfirm, { syncConfirmStore } from '../../components/sync_confirm'
import LineText from '@/pages/order/components/line_text'
const bodyStyle = { marginBottom: '42px' }

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const [processdVisible, setProcessdVisible] = useState(false)
  const [notProcessdVisible, setNotProcessdVisible] = useState(false)
  // isSelectAll和selected仅批量发布采购计划和批量发布加工品计划用
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const isOrderDisabled = () => false

  function handleCreateOrder(): void {
    window.open('#/order/order_manage/create')
  }

  function handleCreateOrderByMenu(): void {
    history.push('/order/order_manage/menu_create')
  }

  function handlePrint() {
    Modal.render({
      onHide: Modal.hide,
      size: 'lg',
      noContentPadding: true,
      children: <OrderPrintModalNew onHide={Modal.hide} isConfig />,
    })
  }

  // 批量同步价格
  const handleBatchSyncPrice = async (params: {
    selected: string[]
    isSelectAll: boolean
  }) => {
    syncConfirm().then(async () => {
      const { isSelectAll, selected } = params
      const options = {
        filter: {
          common_list_order: {
            ...store.getParams(),
            order_ids: !isSelectAll ? selected : undefined,
          },
          paging: { limit: 999 },
        },
        all: !!isSelectAll,
        available_periodic_child_quotation: true,
      }
      if (syncConfirmStore.order_price_to_basic) {
        await BatchSyncOrderPriceToBasic(options)
      } else {
        await BatchSyncPriceToOrder(options)
      }
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const columns: Column<OrderInfoViewOrder>[] = [
    {
      Header: t('订单号'),
      diyGroupName: t('订单信息'),
      id: 'serial_no',
      width: 150,
      diyEnable: false,
      fixed: 'left' as any,
      accessor: (d) => (
        <div className='gm-inline'>
          <a
            href={getOrderDetailUrl(d)}
            className='gm-text-primary'
            style={{ textDecoration: 'underline' }}
            rel='noopener noreferrer'
            target='_blank'
          >
            {d.serial_no}
          </a>
          {(+d.status! & (1 << 14) && (
            <Popover
              showArrow
              center
              type='hover'
              popup={
                <div className='gm-padding-10' style={{ width: '140px' }}>
                  {t('该订单存在售后异常')}
                </div>
              }
            >
              <span className='gm-text-red gm-margin-left-5'>
                <SVGAnomaly />
              </span>
            </Popover>
          )) ||
            ''}
        </div>
      ),
    },
    {
      Header: t('下单日期'),
      diyGroupName: t('订单信息'),
      id: 'order_time',
      accessor: (d) => {
        return moment(new Date(+d.order_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('收货日期'),
      diyGroupName: t('订单信息'),
      id: 'receive_time',
      accessor: (d) => {
        return moment(new Date(+d.receive_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('出库时间'),
      diyGroupName: t('订单信息'),
      id: 'outstock_time',
      accessor: (d) => {
        if (!d.outstock_time || d.outstock_time === '0') return '-'

        return moment(new Date(+d.outstock_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('商户名'),
      diyGroupName: t('订单信息'),
      id: 'customer',
      accessor: (d) => {
        return `${d?.customer?.name}(${d.customer?.customized_code})`
      },
      minWidth: 180,
    },
    {
      Header: t('报价单/菜谱'),
      diyGroupName: t('订单信息'),
      minWidth: 150,
      hide: globalStore.isLite,
      accessor: (d) => {
        return `${
          d?.app_type === App_Type.TYPE_ESHOP
            ? d?.menu?.inner_name || '-'
            : d.quotationName || '-'
        }`
      },
      Cell: ({ value }) => {
        return (
          <Popover
            type='hover'
            showArrow
            popup={
              <div className='gm-padding-10' style={{ width: '300px' }}>
                {value || '-'}
              </div>
            }
          >
            <LineText>{value || '-'}</LineText>
          </Popover>
        )
      },
    },
    {
      Header: t('餐次'),
      diyGroupName: t('订单信息'),
      accessor: (d) => d.menu_period_group?.name || '-',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('就餐人数'),
      diyGroupName: t('订单信息'),
      accessor: (d) => d.dining_count || '-',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('订单状态'),
      diyGroupName: t('订单信息'),
      accessor: 'state',
      minWidth: 100,
      Cell: (props) => (
        <OrderState order={props.original} index={props.index} />
      ),
    },
    {
      Header: t('支付状态'),
      diyGroupName: t('订单信息'),
      id: 'pay_state',
      minWidth: 80,
      accessor: (d) => map_Order_PayState[d.pay_state!] || t('未知'),
    },
    {
      Header: t('下单金额'),
      diyGroupName: t('金额信息'),
      id: 'order_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.order_price!) + Price.getUnit(),
    },
    {
      Header: t('总下单数'),
      diyGroupName: t('订单信息'),
      id: 'order_details',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.orderQuantity!),
    },
    {
      Header: t('商品种类数'),
      diyGroupName: t('订单信息'),
      id: 'order_details1',
      minWidth: 80,
      accessor: (d) => d.catagorySum,
    },
    {
      Header: t('运费金额'),
      diyGroupName: t('金额信息'),
      id: 'freight_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.freight_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('售后金额'),
      diyGroupName: t('金额信息'),
      id: 'aftersale_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.aftersale_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('出库金额'),
      diyGroupName: t('金额信息'),
      id: 'outstock_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.outstock_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('优惠金额'),
      diyGroupName: t('金额信息'),
      id: 'coupon_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.coupon_price! || 0) + Price.getUnit(),
    },
    {
      Header: (
        <HeaderTip
          header={t('销售金额')}
          tip={t(
            '销售额 = 实际商品出库销售额 + 售后金额' +
              `${globalStore.isLite ? '' : '优惠金额 + 运费'}`,
          )}
        />
      ),
      diyItemText: '销售金额',
      diyGroupName: t('金额信息'),
      id: 'sale_price',
      minWidth: 100,
      accessor: (d) => toFixedOrder(+d.sale_price! || 0) + Price.getUnit(),
    },
    {
      Header: (
        <HeaderTip
          header={t('商品销售额')}
          tip={t(
            '商品销售额 = 实际商品出库销售额 + 售后金额' +
              `${globalStore.isLite ? '' : '优惠金额'}`,
          )}
        />
      ),
      diyItemText: '商品销售额',
      diyGroupName: t('金额信息'),
      id: 'detail_sum_sale_price',
      minWidth: 100,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_sale_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('不含税商品销售额'),
      diyGroupName: t('金额信息'),
      id: 'detail_sum_sale_price_no_tax',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_sale_price_no_tax! || 0) + Price.getUnit(),
    },
    {
      Header: t('税额'),
      diyGroupName: t('金额信息'),
      id: 'detail_sum_tax_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_tax_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('支付金额'),
      diyGroupName: t('金额信息'),
      id: 'paid_amount',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.paid_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('退款金额'),
      diyGroupName: t('金额信息'),
      id: 'refund_amount',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.refund_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('实际支付金额'),
      diyGroupName: t('金额信息'),
      id: 'actual_amount',
      minWidth: 90,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.actual_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('订单来源'),
      diyGroupName: t('订单信息'),
      id: 'app_type',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        appTypeMap[`${d.app_type!}_${d.order_op}`] || map_App_Type[d.app_type!],
    },
    {
      Header: t('分拣备注'),
      diyGroupName: t('订单信息'),
      id: 'sorting_remark',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.sorting_remark || '-',
    },
    {
      Header: t('分拣序号'),
      diyGroupName: t('订单信息'),
      id: 'sorting_num',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.sorting_num || '-',
    },
    {
      Header: t('线路'),
      id: 'route',
      diyGroupName: t('线路信息'),
      minWidth: 100,
      accessor: (d) => d.route?.name,
    },
    {
      Header: t('司机'),
      diyGroupName: t('订单信息'),
      id: 'driver',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.driver?.name || '-',
    },
    {
      Header: t('订单备注'),
      diyGroupName: t('订单信息'),
      id: 'remark',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => (
        <Popover
          showArrow
          center
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ width: '300px' }}>
              {d.remark || '-'}
            </div>
          }
        >
          <span className='b-ellipsis-order-remark'>{d.remark || '-'}</span>
        </Popover>
      ),
    },
    {
      Header: t('下单员'),
      diyGroupName: t('订单信息'),
      id: 'creator_id',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => d.creator?.name || '-',
    },
    {
      Header: t('回单状态'),
      diyGroupName: t('订单信息'),
      id: 'status',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => getReceiptStatusText(d.status!),
    },
    {
      Header: t('打印状态'),
      diyGroupName: t('订单信息'),
      id: 'print_state',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => {
        const print = +d.status! & (1 << 9)
        return print ? t('已打印') : t('未打印')
      },
    },
    {
      Header: t('总加单数'),
      diyGroupName: t('套账信息'),
      id: 'total_add_order_value',
      show: false,
      diyEnable: true,
      minWidth: 80,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) => toFixedOrder(+d.total_add_order_value?.quantity?.val!),
    },
    {
      Header: t('总加单金额'),
      diyGroupName: t('套账信息'),
      id: 'total_add_order_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.total_add_order_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('套账下单金额'),
      diyGroupName: t('套账信息'),
      id: 'fake_order_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.fake_order_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('套账出库金额'),
      diyGroupName: t('套账信息'),
      id: 'fake_outstock_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.fake_outstock_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('最后操作时间'),
      diyGroupName: t('订单信息'),
      id: 'update_time',
      minWidth: 130,
      hide: globalStore.isLite,
      accessor: (d) =>
        moment(new Date(+d.update_time!)).format('YYYY-MM-DD HH:mm'),
    },
    {
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Header: TableXUtil.OperationHeader,
      diyGroupName: t('订单信息'),
      diyEnable: false,
      id: 'action',
      fixed: 'right' as any,
      diyItemText: '操作',
      Cell: (props) => <Operation index={props.index} />,
    },
  ]

  const { list } = store
  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <Observer>
              {() => (
                <TableTotalText
                  data={
                    _.without(
                      [
                        {
                          label: t('订单总数'),
                          content: store.summary.orderCount,
                        },
                        {
                          label: t('下单金额'),
                          content: (
                            <Price
                              value={+store.summary.totalOrderPrice}
                              precision={globalStore.dpOrder}
                            />
                          ),
                        },
                        {
                          label: t('出库金额'),
                          content: (
                            <Price
                              value={+store.summary.totalOutStockPrice}
                              precision={globalStore.dpOrder}
                            />
                          ),
                          hide: globalStore.isLite,
                        },
                      ],
                      false,
                    ) as TotalTextOptions[]
                  }
                />
              )}
            </Observer>
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_ORDER_CREATE_ORDER}
            >
              <Button
                type='primary'
                onClick={handleCreateOrder}
                className='gm-margin-right-10'
              >
                {t('新建订单')}
              </Button>
            </PermissionJudge>
            {!globalStore.isLite && (
              <>
                <PermissionJudge
                  permission={Permission.PERMISSION_ORDER_CREATE_ORDER_BY_MENU}
                >
                  <Button
                    type='primary'
                    onClick={handleCreateOrderByMenu}
                    className='gm-margin-right-10'
                  >
                    {t('按菜谱下单')}
                  </Button>
                </PermissionJudge>
                <PermissionJudge
                  permission={Permission.PERMISSION_ORDER_AMEND_ORDER}
                >
                  <FunctionSet
                    right
                    data={[
                      {
                        text: t('补录订单'),
                        onClick: () =>
                          history.push('/order/order_manage/repair'),
                      },
                      {
                        text: t('批量导入'),
                        onClick: () => {
                          Modal.render({
                            size: 'md',
                            title: t('批量导入订单'),
                            children: <BatchImport />,
                          })
                        },
                      },
                      {
                        text: t('打印设置'),
                        onClick: handlePrint,
                      },
                    ]}
                  />
                </PermissionJudge>
              </>
            )}
          </>
        }
      >
        <Table<OrderInfoViewOrder>
          isDiy
          isBatchSelect
          id='viewOrder'
          data={list}
          keyField='order_id'
          isSelectorDisable={isOrderDisabled}
          fixedSelect
          columns={columns}
          batchActions={
            _.without(
              [
                globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_UPDATE_ORDER,
                ) && {
                  children: (
                    <BatchActionEdit>{t('批量修改订单状态')}</BatchActionEdit>
                  ),
                  onAction: (selected: string[], isSelectAll: boolean) => {
                    function handleCancel() {
                      Modal.hide()
                    }
                    function handleSave(status: Order_State, remark: string) {
                      BatchUpdateOrderState({
                        filter: {
                          common_list_order: isSelectAll
                            ? store.getParams()
                            : { order_ids: selected },
                          paging: { limit: 100 },
                        },
                        to_set_state: status,
                        sorting_remark: remark,
                        all: isSelectAll,
                      }).then(() => {
                        handleCancel()
                        globalStore.showTaskPanel('1')
                        return null
                      })
                    }

                    Modal.render({
                      children: (
                        <EditState
                          selected={selected}
                          isSelectAll={isSelectAll}
                          onCancel={handleCancel}
                          onOk={handleSave}
                        />
                      ),
                      size: 'md',
                      title: t('修改订单状态'),
                      onHide: Modal.hide,
                    })
                  },
                },
                ...(globalStore.isLite
                  ? [
                      globalStore.hasPermission(
                        Permission.PERMISSION_DELIVERY_PRINT_TASK,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('批量打印')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectedAll: boolean,
                        ) => {
                          orderTaskStore.handleChangeSelect(
                            'selectedRecord',
                            selected,
                          )
                          orderTaskStore.handleChangeSelect(
                            'isSelectedAll',
                            isSelectedAll,
                          )
                          openModal()
                          orderTaskStore.paramsInit()
                        },
                      },
                    ]
                  : [
                      {
                        children: (
                          <BatchActionDefault>
                            {t('批量同步价格')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          handleBatchSyncPrice({ selected, isSelectAll })
                        },
                      },
                      globalStore.hasPermission(
                        Permission.PERMISSION_ORDER_RELEASE_NONPROCESS_PLAN,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('批量发布采购计划')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          setNotProcessdVisible(true)
                        },
                      },
                      globalStore.hasPermission(
                        Permission.PERMISSION_ORDER_RELEASE_PROCESS_PLAN,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('批量发布生产计划')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          setProcessdVisible(true)
                        },
                      },
                      {
                        children: (
                          <BatchActionDefault>
                            {t('批量生成销售出库单')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          BatchSyncSaleOutStockSheetFromOrder({
                            order_filter: {
                              common_list_order: isSelectAll
                                ? store.getParams()
                                : { order_ids: selected },
                              paging: { limit: 100 },
                            },
                            all_order: isSelectAll,
                          }).then(() => {
                            globalStore.showTaskPanel('1')
                            return null
                          })
                        },
                      },
                    ]),
              ],
              false,
            ) as BatchActionBarItem[]
          }
        />
      </BoxTable>
      <Drawer
        title={
          <DrawerTitle
            title={t('发布采购计划')}
            count={selected.length}
            isSelectAll={isSelectAll}
          />
        }
        visible={notProcessdVisible}
        width='800px'
        destroyOnClose
        bodyStyle={bodyStyle}
        onClose={() => setNotProcessdVisible(false)}
      >
        <NotProcessedProductPlan
          onClose={() => setNotProcessdVisible(false)}
          isSelectAll={isSelectAll}
          selected={selected}
          isOrder
        />
      </Drawer>

      <Drawer
        title={
          <DrawerTitle
            title={t('发布生产计划')}
            count={selected.length}
            isSelectAll={isSelectAll}
          />
        }
        visible={processdVisible}
        width='800px'
        destroyOnClose
        bodyStyle={bodyStyle}
        onClose={() => setProcessdVisible(false)}
      >
        <ProcessedProductPlan
          onClose={() => setProcessdVisible(false)}
          isSelectAll={isSelectAll}
          selected={selected}
          isOrder
        />
      </Drawer>
    </>
  )
}

export default observer(List)
