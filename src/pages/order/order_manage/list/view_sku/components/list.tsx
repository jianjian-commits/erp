import React, { useState } from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  RightSideModal,
  Price,
  Modal,
  Popover,
  BoxTableProps,
} from '@gm-pc/react'
import {
  Table,
  TableXUtil,
  BatchActionDefault,
  BatchActionEdit,
  BatchActionDelete,
  Column,
} from '@gm-pc/table-x'
import { gmHistory as history } from '@gm-common/router'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import Operation from './operation'
import ModifyPrice from './modify_price'
import {
  ProcessedProductPlan,
  NotProcessedProductPlan,
} from '../../components/product_plan'
import DeleteSsuInBatch from '../../components/deleteSsu_inBatch'
import store from '../store'
import globalStore from '@/stores/global'

import OutStockCell from './out_stock_cell'
import { SkuDetail } from '../../../../interface'
import {
  map_Order_State,
  map_SortingStatus,
  OrderDetail_Status,
} from 'gm_api/src/order'
import {
  BatchSyncOrderPriceToBasic,
  BatchSyncPriceToOrder,
} from 'gm_api/src/orderlogic'

import { parseSsu, toFixedOrder, list2Map, convertUnit } from '@/common/util'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import {
  Sku_SupplierCooperateModelType,
  Unit,
  UnitValue,
} from 'gm_api/src/merchandise'
import {
  getFeeUnitName,
  getOrderDetailUrl,
  getOrderUnitName,
  toBasicUnit,
} from '../../../../util'

import SVGAnomaly from '@/svg/triangle-warning.svg'
import HeaderTip from '@/common/components/header_tip'

import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import { Sku, Ssu } from '@/pages/order/order_manage/components/interface'
import Big from 'big.js'

import {
  Drawer,
  message,
  Select,
  Popover as APopover,
  Dropdown,
  Menu,
} from 'antd'
import LineText from '@/pages/order/components/line_text'
import DrawerTitle from '../../components/product_plan/components/process_drawer_title'
import { BatchActionBarItem } from '@gm-pc/table-x/src/components'
import { orderState4Light } from '@/pages/order/enum'
import { App_Type } from 'gm_api/src/common'
import syncConfirm, { syncConfirmStore } from '../../components/sync_confirm'
import { CooperateModelMapType } from '@/pages/purchase/manage/task/interface'
import SvgPriceReference from '@/svg/price-reference.svg'
import CurrentSellPriceTable from '../../components/popover/current_sell_price_table'
import { openHistoryPriceModal } from '@/pages/merchandise/components/history_price_modal'
import triangle_down from '@/img/triangle_down.png'
import OrderReferencePriceMap from '@/pages/order/order_manage/components/order_reference_price_map'
import Filter from '@/svg/filter.svg'

export const getOrderColumns = (): Column<SkuDetail>[] => {
  return [
    {
      Header: t('商品名'),
      id: 'sku_name',
      minWidth: 150,
      accessor: (d) => (
        <div className='gm-inline'>
          {d?.sku_name}
          {(+d?.status! & (1 << 12) && (
            <Popover
              showArrow
              center
              type='hover'
              popup={
                <div className='gm-padding-10' style={{ width: '140px' }}>
                  {t('该商品存在售后异常')}
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
      Header: t('商户名'),
      id: 'customer',
      accessor: (d) => {
        return `${d?.customer?.name}(${d.customer?.customized_code})`
      },
      minWidth: 180,
    },
    {
      Header: t('订单号'),
      id: 'order.serial_no',
      minWidth: 120,
      accessor: (d) => (
        <a
          href={getOrderDetailUrl(d.order!)}
          className='gm-text-primary'
          style={{ textDecoration: 'underline' }}
          rel='noopener noreferrer'
          target='_blank'
        >
          {d.order?.serial_no}
        </a>
      ),
    },
    {
      Header: t('下单单位'),
      id: 'unit_id',
      minWidth: 120,
      // hide: !globalStore.isLite,
      diyEnable: false,
      accessor: (d) => {
        // 如果下单单位是自定义单位，还要找一下对应的换算单位来展示
        const { parentUnit, unit } = d
        return getOrderUnitName(parentUnit, unit!)
      },
    },
    {
      Header: t('下单数'),
      id: 'quantity',
      minWidth: 120,
      // hide: !globalStore.isLite,
      accessor: (d) => {
        const { order_unit_value_v2 } = d
        const quantity = order_unit_value_v2?.quantity!.val
        return quantity
      },
    },
    {
      Header: t('单价'),
      id: 'price',
      minWidth: 120,
      // hide: !globalStore.isLite,
      accessor: (original, index) => {
        return (
          <Observer>
            {() => {
              const { order_unit_value_v2, sku_unit_is_current_price } =
                original
              const price = order_unit_value_v2?.price!.val
              if (sku_unit_is_current_price) return <span>时价</span>

              return (
                <div className='tw-flex tw-items-center'>
                  <div>
                    {toFixedOrder(price || 0) +
                      Price.getUnit() +
                      '/' +
                      getFeeUnitName(original as any)}
                  </div>
                  <div
                    id={`ReferencePriceMap-order-list-${index}`}
                    className='tw-inline-flex tw-items-center'
                  />
                </div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: (
        <Observer>
          {() => {
            return (
              <div className='tw-flex tw-items-center tw-justify-between'>
                <Popover
                  type='hover'
                  top
                  showArrow
                  popup={
                    <div className='gm-padding-10'>{`来源: ${
                      store.priceOf === 'purchase_reference_prices'
                        ? '最近采购价'
                        : '最近入库价'
                    }`}</div>
                  }
                >
                  <span>参考成本</span>
                </Popover>
                <Dropdown
                  trigger='click'
                  overlay={
                    <Menu selectedKeys={[store.priceOf]}>
                      {[
                        {
                          key: 'purchase_reference_prices',
                          label: '最近采购价',
                        },
                        {
                          key: 'in_stock_reference_prices',
                          label: '最近入库价',
                        },
                      ].map((item) => {
                        return (
                          <Menu.Item
                            key={item.key}
                            onClick={() => {
                              store.priceOf = item.key as any
                            }}
                          >
                            {item.label}
                          </Menu.Item>
                        )
                      })}
                    </Menu>
                  }
                >
                  <span className='b-framework-info-down hover:tw-bg-gray-200 tw-cursor-pointer'>
                    <Filter style={{ width: 16, height: 16 }} />
                  </span>
                </Dropdown>
              </div>
            )
          }}
        </Observer>
      ),
      id: 'priceOf',
      diyGroupName: t('金额信息'),
      diyItemText: '参考成本',
      show: false,
      minWidth: 130,
      Cell: ({ original, index }) => {
        return (
          <Observer>
            {() => {
              return (
                <OrderReferencePriceMap
                  type={store.priceOf}
                  record={{
                    order_unit_id: original.unit_id!,
                    parentId: original.sku_id,
                    skuName: original.sku_name,
                    fee_unit_price: {
                      val: original.order_unit_value_v2?.price?.val!,
                      unit_id: original.unit_id!,
                    },
                  }}
                  arrowSelector={`#ReferencePriceMap-order-list-${index}`}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('最近销售价'),
      id: 'sell_price',
      diyGroupName: t('金额信息'),
      show: false,
      minWidth: 130,
      Cell: ({ original, index }) => {
        return (
          <Observer>
            {() => {
              const target =
                store.reference.sale_reference_prices_list[index]
                  ?.sale_reference_prices
              let unitVal = target?.[0]?.prices?.price
              if (!unitVal) return <span>-</span>
              let unit: Unit | undefined
              if (original.unit_id !== unitVal?.unit_id) {
                unitVal = unitVal && convertUnit(unitVal, original.unit_id!)
                unit = globalStore.getUnit(unitVal?.unit_id!)
              } else {
                unit = original.unit
              }
              const price = unitVal?.val
              return (
                <div className='tw-flex tw-items-center'>
                  <div className='tw-mr-1'>
                    <span>{price ? Big(price).toFixed(2) : '-'}</span>
                    <span>{t('元')} </span>
                    <span>/</span>
                    <span>{unit?.name || '-'}</span>
                  </div>
                  <APopover
                    placement='bottomRight'
                    content={
                      <CurrentSellPriceTable
                        sale_reference_prices={target || []}
                        skuUnit={original.unit!}
                        onClick={() => {
                          if (!original.unit_id || !original.sku_id) return
                          openHistoryPriceModal({
                            title: original.name + '-历史销售价',
                            sku_unit_filter: {
                              receive_customer_id:
                                original.customer.customer_id,
                              order_unit_id: original.unit_id!,
                              sku_id: original.sku_id!,
                              unit_id: original.unit_id!,
                            },
                          })
                        }}
                      />
                    }
                    trigger='hover'
                    arrowPointAtCenter
                  >
                    <SvgPriceReference
                      className='tw-text-blue-500 tw-cursor-pointer hover:tw-bg-blue-50'
                      onClick={() => {
                        // if (!original.unit_id || !original.sku_id) return
                        // openHistoryPriceModal({
                        //   title: original.name + '-历史销售价',
                        //   sku_unit_filter: {
                        //     receive_customer_id: original.customer.customer_id,
                        //     order_unit_id: original.unit_id!,
                        //     sku_id: original.sku_id!,
                        //     unit_id: original.unit_id!,
                        //   },
                        // })
                      }}
                    />
                  </APopover>
                </div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('报价单/菜谱'),
      // accessor: 'quotation.inner_name',
      minWidth: 150,
      hide: globalStore.isLite,
      accessor: (d) =>
        d.order?.app_type === App_Type.TYPE_ESHOP
          ? d.menu?.inner_name || '-'
          : d.quotationName || '-',
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
      accessor: (d) => d.menu_period_group?.name || '-',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    // 此字段被订单详情和菜谱订单详情页复用
    {
      Header: t('参考成本单价'),
      id: 'unit_cost',
      minWidth: 120,
      hide: globalStore.isLite,
      accessor: (d) => {
        return (
          <Observer>
            {() => {
              const xsu = (d as SkuDetail).ssu || (d as unknown as Sku)
              const { val, unit_id } = store.reference.getUnitReferencePrice(
                xsu,
              ) as UnitValue
              // const parse = parseSsu(xsu)
              // const unitName = parse.ssu_unit_parent_name
              const unitName = globalStore.getUnitName(unit_id)
              const price = Big(val || 0).toFixed(2)
              return (
                <span>
                  {+price ? price + Price.getUnit() + '/' + unitName : '-'}
                </span>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('下单金额'),
      id: 'order_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.order_price!) + Price.getUnit(),
    },
    {
      Header: t('出库数'),
      accessor: 'outstock_unit_value_v2.quantity.val',
      minWidth: 300,
      hide: globalStore.isLite,
      Cell: (props) => {
        return <Observer>{() => <OutStockCell index={props.index} />}</Observer>
      },
    },
    {
      Header: t('出库金额'),
      id: 'outstock_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => {
        return (
          <Observer>
            {() => {
              return (
                <>{toFixedOrder(+d.outstock_price! || 0) + Price.getUnit()}</>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('商品销售额')}
          tip={t('商品销售额 = 实际商品出库销售额 + 售后金额 + 优惠金额')}
        />
      ),
      id: 'sale_price',
      minWidth: 100,
      accessor: (d) => {
        return (
          <Observer>
            {() => {
              return <>{toFixedOrder(+d.sale_price! || 0) + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('线路'),
      id: 'route',
      diyGroupName: t('线路信息'),
      minWidth: 100,
      accessor: (d) => d.route?.name,
    },
    // 此字段被订单详情和菜谱订单详情页复用
    {
      Header: t('参考成本金额'),
      id: 'cost',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => {
        return (
          <Observer>
            {() => {
              const xsu = (d as SkuDetail).ssu || (d as unknown as Sku)
              const count =
                (d as SkuDetail).order_unit_value_v2?.quantity?.val! ||
                (d as unknown as Ssu).quantity ||
                0
              const { val, unit_id } = store.reference.getUnitReferencePrice(
                xsu,
              ) as UnitValue
              if (!val || !unit_id || !xsu.unit_id) return <span>-</span>
              // 覆盖掉fee_unit_id
              const sku = _.cloneDeep(xsu)
              sku.fee_unit_id = unit_id
              const price = toFixedOrder(
                Big(
                  toBasicUnit((count as string) || '0', sku, 'quantity'),
                ).times(toBasicUnit(val || '0', sku, 'price')),
              )
              return <>{price ? price + Price.getUnit() : '-'}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('不含税商品销售额'),
      id: 'sale_price_no_tax',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        toFixedOrder(+d.sale_price_no_tax! || 0) + Price.getUnit(),
    },
    {
      Header: t('税额'),
      id: 'tax_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.tax_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('税率'),
      id: 'tax',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => `${d?.tax || '-'}%`,
    },
    {
      Header: t('售后金额'),
      id: 'aftersale_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.aftersale_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('退货退款商品数'),
      minWidth: 120,
      id: 'obs',
      show: false,
      hide: globalStore.isLite,
      accessor: () => 0,
    },
    {
      Header: t('仅退款数'),
      minWidth: 80,
      id: 'obs1',
      show: false,
      hide: globalStore.isLite,
      accessor: (d) => 0,
    },
    // {
    //   Header: t('是否加工品'),
    //   minWidth: 80,
    //   id: 'process',
    //   show: false,
    //   hide: globalStore.isLite,
    //   accessor: (d) =>
    //     d.ssu?.process || d.ssu?.need_package_work ? '是' : '否',
    // },
    {
      Header: t('是否发布生产计划'),
      minWidth: 140,
      id: 'STATUS_IS_CREATE_PRODUCTION_TASK',
      show: false,
      hide: globalStore.isLite,
      accessor: (d) => {
        return (+d.status! &
          OrderDetail_Status.STATUS_IS_CREATE_PRODUCTION_TASK) ===
          OrderDetail_Status.STATUS_IS_CREATE_PRODUCTION_TASK
          ? '已发布'
          : '未发布'
      },
    },
    {
      Header: t('是否发布采购计划'),
      minWidth: 140,
      id: 'STATUS_IS_CREATE_PURCHASE_TASK',
      show: false,
      hide: globalStore.isLite,
      accessor: (d) => {
        return (+d.status! &
          OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK) ===
          OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK
          ? '已发布'
          : '未发布'
      },
    },
    {
      Header: t('订单状态'),
      id: 'order.state',
      minWidth: 100,
      accessor: (d) =>
        globalStore.isLite
          ? orderState4Light[d.order?.state as keyof typeof orderState4Light]
          : map_Order_State[d.order?.state!],
    },
    {
      Header: t('分拣备注'),
      id: 'sorting_remark',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.order?.sorting_remark || '-',
    },
    {
      Header: t('分拣标签'),
      id: 'sorting_mark_id',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('分拣状态'),
      id: 'sorting_status',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => map_SortingStatus[d.sorting_status!] || '-',
    },
    {
      Header: t('验收状态'),
      id: 'accept_status',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => {
        if ((+d.status! & OrderDetail_Status.STATUS_ACCEPT) === 0) {
          return t('未验收')
        } else {
          return t('已验收')
        }
      },
    },
    {
      Header: t('验收数'),
      id: `accept_value_${shopStore.inspectionCount_code}`,
      minWidth: 100,
      hide: globalStore.isLite,
      show: shopStore.inspectionCount_code,
      accessor: (d) => {
        // 2.若商品未验收，订单详情验收数显示为-
        // 3.若商品已验收，订单签收后，将验收数同步至订单详情验收数
        const isAccept = (+d.status! & OrderDetail_Status.STATUS_ACCEPT) !== 0
        if (!isAccept) {
          return '-'
        }
        const { parentUnit, unit, accept_value } = d
        const quantity = accept_value?.calculate?.quantity ?? '0'
        // const parse = parseSsu(d.ssu)
        // const unitName = parse.ssu_unit_parent_name

        return quantity + getOrderUnitName(parentUnit, unit!)
      },
    },
    {
      Header: t('商品备注'),
      id: 'remark',
      minWidth: 100,
      accessor: (d) => (
        <Popover
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ width: '300px' }}>
              {d.remark || '-'}
            </div>
          }
        >
          <LineText>{d.remark || '-'}</LineText>
        </Popover>
      ),
    },
    {
      Header: t('供应商协作模式'),
      id: 'supplier_cooperate_model_type',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) =>
        CooperateModelMap[
          d.supplier_cooperate_model_type ||
            Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
        ],
    },
    {
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Header: TableXUtil.OperationHeader,
      diyEnable: false,
      id: 'action',
      fixed: 'right' as any,
      diyItemText: '操作',
      Cell: (props) => <Operation index={props.index} />,
    },
  ]
}

const bodyStyle = { marginBottom: '42px' }
const CooperateModelMap: CooperateModelMapType = {
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const [processdVisible, setProcessdVisible] = useState(false)
  const [notProcessdVisible, setNotProcessdVisible] = useState(false)
  // isSelectAll和selected仅批量发布采购计划和批量发布加工品计划用
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const isSsuDisabled = () => false

  function handleCreateOrder() {
    window.open('#/order/order_manage/create')
  }

  function handleCreateOrderByMenu() {
    history.push('/order/order_manage/menu_create')
  }

  const { list } = store
  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <Observer>
              {() => {
                return (
                  <TableTotalText
                    data={[
                      {
                        label: t('商品总数'),
                        content: store.paging.count,
                      },
                    ]}
                  />
                )
              }}
            </Observer>
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_ORDER_CREATE_ORDER}
            >
              <>
                <Button
                  type='primary'
                  onClick={handleCreateOrder}
                  className='gm-margin-right-10'
                >
                  {t('新建订单')}
                </Button>
              </>
            </PermissionJudge>
            {!globalStore.isLite && (
              <PermissionJudge
                permission={Permission.PERMISSION_ORDER_CREATE_ORDER_BY_MENU}
              >
                <>
                  <Button
                    type='primary'
                    onClick={handleCreateOrderByMenu}
                    className='gm-margin-right-10'
                  >
                    {t('按菜谱下单')}
                  </Button>
                </>
              </PermissionJudge>
            )}
          </>
        }
      >
        <Table<SkuDetail>
          isBatchSelect
          isDiy
          id='viewSkus'
          data={list}
          keyField='order_detail_id'
          fixedSelect
          isSelectorDisable={isSsuDisabled}
          columns={getOrderColumns()}
          batchActions={
            _.without(
              [
                globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_UPDATE_ORDER,
                ) && {
                  children: (
                    <BatchActionEdit>{t('批量修改单价')}</BatchActionEdit>
                  ),
                  onAction: (selected: string[], isSelectedAll: boolean) => {
                    RightSideModal.render({
                      children: (
                        <ModifyPrice
                          selected={selected}
                          isSelectedAll={isSelectedAll}
                          destory={RightSideModal.hide}
                        />
                      ),
                      onHide: RightSideModal.hide,
                      title: t('批量修改单价'),
                      style: {
                        width: '850px',
                      },
                    })
                  },
                },
                {
                  children: (
                    <BatchActionDefault>{t('批量替换商品')}</BatchActionDefault>
                  ),
                  onAction: (selected: string[], isSelectedAll: boolean) => {
                    history.push(
                      `/order/order_manage/list/replace_sku?type=sku&all=${!!isSelectedAll}&filter=${JSON.stringify(
                        {
                          ...store.getParams(),
                          detail_ids: !isSelectedAll ? selected : undefined,
                        },
                      )}`,
                    )
                  },
                },
                ...(globalStore.isLite
                  ? []
                  : [
                      {
                        children: (
                          <BatchActionDefault>
                            {t('批量同步价格')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectedAll: boolean,
                        ) => {
                          syncConfirm().then(async () => {
                            const options = {
                              filter: {
                                ...store.getParams(),
                                paging: { limit: 100 },
                                detail_ids: !isSelectedAll
                                  ? selected
                                  : undefined,
                              },
                              all: !!isSelectedAll,
                              available_periodic_child_quotation: true,
                            }
                            if (syncConfirmStore.order_price_to_basic) {
                              await BatchSyncOrderPriceToBasic(options)
                            } else {
                              await BatchSyncPriceToOrder(options)
                            }
                            globalStore.showTaskPanel('1')
                          })
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
                          const rightSelected = !isSelectAll ? selected : []
                          if (!isSelectAll && !rightSelected.length) {
                            message.warning('至少选中一项加工品')
                            return
                          }
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          setProcessdVisible(true)
                        },
                      },
                      globalStore.hasPermission(
                        Permission.PERMISSION_ORDER_UPDATE_ORDER,
                      ) && {
                        children: (
                          <BatchActionDelete>{t('批量删除')}</BatchActionDelete>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          Modal.render({
                            children: (
                              <DeleteSsuInBatch
                                ssuIds={selected}
                                onClick={() =>
                                  store.batchDeleteOrderDetails(
                                    selected,
                                    isSelectAll,
                                  )
                                }
                                onCancle={Modal.hide}
                              />
                            ),
                            onHide: Modal.hide,
                            title: t('批量删除商品'),
                            size: 'sm',
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
        />
      </Drawer>
    </>
  )
}

export default observer(List)
