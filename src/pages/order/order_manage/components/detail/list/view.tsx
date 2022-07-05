import React, { useMemo, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { Price, Popover, Flex } from '@gm-pc/react'
import { Observer, observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import CellImage from '../../../../components/cell_image'
import CellRefund from './components/cell_refund'
import store from '../store'
import globalStore from '@/stores/global'
import { DetailListItem, Sku } from '../../interface'
import { convertUnit, toFixedOrder } from '@/common/util'
import { getListImages } from '@/common/service'
import { OrderDetail_Status, Order_Type } from 'gm_api/src/order'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import { gmHistory as history } from '@gm-common/router'
import {
  getFeeUnitName,
  getOrderUnitName,
  isCombineSku,
} from '@/pages/order/util'
import {
  Quotation_Type,
  Sku_SupplierCooperateModelType,
  Unit,
} from 'gm_api/src/merchandise'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import { getOrderColumns } from '@/pages/order/order_manage/list/view_sku/components/list'
import LineText from '@/pages/order/components/line_text'
import { App_Type } from 'gm_api/src/common'
import CellIngredients from './components/cell_ingredients'
import CellPrint from '@/pages/order/order_manage/components/cell_print'
import { doubleUnitOutStockText } from '@/pages/order/order_manage/components/detail/util'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'
import { isZero } from '@/pages/order/number_utils'
import { Dropdown, Menu, Popover as APopover, Drawer } from 'antd'
import { createPortal } from 'react-dom'
import SvgFall from '@/svg/fall.svg'
import CurrentSellPriceTable from '@/pages/order/order_manage/list/components/popover/current_sell_price_table'
import SvgPriceReference from '@/svg/price-reference.svg'
import { openHistoryPriceModal } from '@/pages/merchandise/components/history_price_modal'
import OrderReferencePriceMap from '@/pages/order/order_manage/components/order_reference_price_map'
import Filter from '@/svg/filter.svg'
import TrendDown from '@/svg/trend_down.svg'
import DrawerTitle from '@/pages/order/order_manage/list/components/product_plan/components/process_drawer_title'
import NotProcessedProductPlan from './components/not_processed'
import ProcessedProductPlan from './components/processed'

type CooperateModelMapType = {
  [key in Sku_SupplierCooperateModelType]: string
}

const CooperateModelMap: CooperateModelMapType = {
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

export const getColumns = (): Column<DetailListItem>[] => {
  // 隐藏加单、套账单元格
  const hideFakeOrderCell = [
    // 轻巧版
    globalStore.isLite,
    // 菜谱订单
    store.order.quotation_type === Quotation_Type.WITH_TIME,
    // 没有套账权限
    !globalStore.hasPermission(
      Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
    ),
  ].includes(true)

  const { setPublishPurchase } = store
  return [
    {
      Header: t('序号'),
      diyGroupName: t('商品信息'),
      accessor: 'sort_num',
      // minWidth: 50,
      width: 50,
      Cell: (cellProps) => cellProps.index + 1,
    },
    {
      Header: t('商品图'),
      diyGroupName: t('商品信息'),
      accessor: 'img',
      // minWidth: 80,
      width: 70,
      Cell: (cellProps) => (
        <CellImage
          img={
            getListImages(cellProps.original.repeated_field?.images || [])[0]
              ?.url
          }
        />
      ),
    },
    {
      Header: t('商品编码'),
      diyGroupName: t('商品信息'),
      accessor: 'customize_code',
      // minWidth: 120,
      width: 150,
      diyEnable: false,
    },
    {
      Header: t('商品名'),
      diyGroupName: t('商品信息'),
      accessor: 'name',
      // minWidth: 150,
      width: globalStore.isLite ? 300 : 190,
      diyItemText: t('商品名'),
      diyEnable: false,
      Cell: (cellProps) => {
        const { name, detail_status } = cellProps.original
        const { serial_no } = store.order
        if (+detail_status! & (1 << 12)) {
          return (
            <div className='gm-inline'>
              {name}
              <CellIngredients
                sku={cellProps.original}
                index={cellProps.index}
              />
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
                <div
                  className='gm-text-red gm-cursor gm-margin-left-5'
                  onClick={() =>
                    history.push(
                      `/order/after_sales/after_sales_list?order_serial_no=${serial_no}`,
                    )
                  }
                >
                  <SVGAnomaly />
                </div>
              </Popover>
            </div>
          )
        }
        return (
          <Flex alignCenter>
            {name}
            <CellIngredients sku={cellProps.original} index={cellProps.index} />
          </Flex>
        )
      },
    },
    {
      Header: t('下单单位'),
      diyGroupName: t('商品信息'),
      accessor: 'unit_id',
      width: 190,
      // hide: !globalStore.isLite,
      diyEnable: false,
      Cell: (cellProps) => {
        const { parentUnit, unit } = cellProps.original
        return getOrderUnitName(parentUnit, unit!)
      },
    },
    {
      Header: t('分类'),
      diyGroupName: t('商品信息'),
      minWidth: 100,
      diyItemText: t('分类'),
      hide: globalStore.isLite,
      accessor: 'category_name',
    },
    {
      Header: t('报价单简称（对外）'),
      diyGroupName: t('商品信息'),
      minWidth: 150,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { menu, quotationName } = cellProps.original
        const value =
          store.type === App_Type.TYPE_ESHOP
            ? menu?.outer_name! || '-'
            : quotationName
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
            <LineText>{value}</LineText>
          </Popover>
        )
      },
    },
    {
      Header: t('下单数'),
      diyGroupName: t('商品信息'),
      accessor: 'quantity',
      // minWidth: 120,
      width: 190,
      diyEnable: false,
      // hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { quantity, unit } = cellProps.original
        return globalStore.isLite
          ? toFixedOrder(Big(quantity || 0)) || '-'
          : toFixedOrder(Big(quantity || 0)) + unit?.name || '-'
      },
    },
    {
      Header: t('单价'),
      diyGroupName: t('商品信息'),
      accessor: 'price',
      // minWidth: 120,
      width: 190,
      diyEnable: false,
      Cell: (cellProps) => {
        const { price, sku_unit_is_current_price } = cellProps.original
        if (sku_unit_is_current_price) return <span>时价</span>
        return (
          <div className='tw-flex tw-items-center'>
            <div>
              {toFixedOrder(Big(price || 0)) +
                Price.getUnit() +
                '/' +
                getFeeUnitName(cellProps.original)}
            </div>
            <div
              id={`ReferencePriceMap-order-detail-${cellProps.index}`}
              className='tw-inline-flex tw-items-center'
            />
          </div>
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
                    skuName: original.name,
                    fee_unit_price: {
                      val: original.price as string,
                      unit_id: original.unit_id!,
                    },
                  }}
                  arrowSelector={`#ReferencePriceMap-order-detail-${index}`}
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
                  <div>
                    <span>{price ? Big(price).toFixed(2) : '-'}</span>
                    <span>{t('元')} </span>
                    <span>/</span>
                    <span>{unit?.name || '-'}</span>
                  </div>
                  <APopover
                    placement='bottomLeft'
                    content={
                      <CurrentSellPriceTable
                        sale_reference_prices={target || []}
                        skuUnit={original.unit!}
                        onClick={() => {
                          if (!original.unit_id || !original.sku_id) return
                          openHistoryPriceModal({
                            title: original.name + '-历史销售价',
                            sku_unit_filter: {
                              order_unit_id: original.unit_id!,
                              unit_id: original.unit_id!,
                              sku_id: original.sku_id!,
                              receive_customer_id:
                                store.order.customer?.customer_id!,
                            },
                          })
                        }}
                      />
                    }
                    trigger='hover'
                    arrowPointAtCenter
                  >
                    <SvgPriceReference
                      className='tw-text-blue-500 tw-ml-1 tw-cursor-pointer hover:tw-bg-blue-50'
                      onClick={() => {
                        // if (!original.unit_id || !original.sku_id) return
                        // openHistoryPriceModal({
                        //   title: original.name + '-历史销售价',
                        //   sku_unit_filter: {
                        //     order_unit_id: original.unit_id!,
                        //     unit_id: original.unit_id!,
                        //     sku_id: original.sku_id!,
                        //     receive_customer_id:
                        //       store.order.customer?.customer_id!,
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
      Header: t('加单数1'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_value1',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_value1, unit } = cellProps.original
        const val = add_order_value1?.quantity?.val
        if (!val || isZero(val)) {
          return '-'
        }
        const value = Big(val || 0)
        return toFixedOrder(value) + unit?.name
      },
    },
    {
      Header: t('加单数2'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_value2',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_value2, unit } = cellProps.original
        const val = add_order_value2?.quantity?.val
        if (!val || isZero(val)) {
          return '-'
        }
        const value = Big(val || 0)
        return toFixedOrder(value) + unit?.name
      },
    },
    {
      Header: t('加单数3'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_value3',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_value3, unit } = cellProps.original
        const val = add_order_value3?.quantity?.val
        if (!val || isZero(val)) {
          return '-'
        }
        const value = Big(val || 0)
        return toFixedOrder(value) + unit?.name
      },
    },
    {
      Header: t('加单数4'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_value4',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_value4, unit } = cellProps.original
        const val = add_order_value4?.quantity?.val
        if (!val || isZero(val)) {
          return '-'
        }
        const value = Big(val || 0)
        return toFixedOrder(value) + unit?.name
      },
    },
    {
      Header: t('总加单数'),
      diyGroupName: t('套账信息'),
      accessor: 'total_add_order_value',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { total_add_order_value, unit } = cellProps.original
        const value = Big(total_add_order_value?.quantity?.val || 0)
        return toFixedOrder(value) + unit?.name || '-'
      },
    },
    {
      Header: t('是否打印'),
      diyGroupName: t('商品信息'),
      accessor: 'is_print',
      width: 80,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { is_print } = cellProps.original
        return <CellPrint value={is_print} readonly />
      },
    },
    {
      Header: t('加单金额1'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_price1',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_price1 } = cellProps.original
        const value = Big(add_order_price1 || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('加单金额2'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_price2',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_price2 } = cellProps.original
        const value = Big(add_order_price2 || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('加单金额3'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_price3',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_price3 } = cellProps.original
        const value = Big(add_order_price3 || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('加单金额4'),
      diyGroupName: t('套账信息'),
      accessor: 'add_order_price4',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { add_order_price4 } = cellProps.original
        const value = Big(add_order_price4 || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('总加单金额'),
      diyGroupName: t('套账信息'),
      accessor: 'total_add_order_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { total_add_order_price } = cellProps.original
        const value = Big(total_add_order_price || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('套账下单金额'),
      diyGroupName: t('套账信息'),
      accessor: 'fake_order_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { fake_order_price } = cellProps.original
        const value = Big(fake_order_price || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      Header: t('套账出库金额'),
      diyGroupName: t('套账信息'),
      accessor: 'fake_outstock_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        const { fake_outstock_price } = cellProps.original
        const value = Big(fake_outstock_price || 0)
        return toFixedOrder(value) + Price.getUnit()
      },
    },
    {
      ...(getOrderColumns().find(
        (item) => item.Header === '参考成本单价',
      )! as Column<DetailListItem>),
      diyGroupName: t('商品信息'),
    },
    // {
    //   Header: t('不含税单价（计量单位）'),
    //   accessor: 'std_price_with_no_tax',
    //   minWidth: 120,
    //   hide: globalStore.isLite,
    //   Cell: (cellProps) => {
    //     const ssu = cellProps.original
    //     const price = cellProps.original.stdPrice
    //     if (!price && ssu.basic_price?.current_price) {
    //       return <div>{t('时价')}</div>
    //     }
    //     return (
    //       getEndlessPrice(
    //         Big(price || 0).div(
    //           Big(ssu?.tax || 0)
    //             .div(100)
    //             .plus(1),
    //         ),
    //       ) +
    //       Price.getUnit() +
    //       '/' +
    //       (ssu?.ssu_unit_parent_name || '-')
    //     )
    //   },
    // },
    // {
    //   Header: t('不含税单价（包装单位）'),
    //   accessor: 'price_with_no_tax',
    //   minWidth: 120,
    //   hide: globalStore.isLite,
    //   Cell: (cellProps) => {
    //     const ssu = cellProps.original
    //     if (!ssu.price && ssu.basic_price?.current_price) {
    //       return <div>{t('时价')}</div>
    //     }
    //     // 不含税单价 = 单价 / （1 + 税额）
    //     return (
    //       getEndlessPrice(
    //         Big(ssu.price).div(
    //           Big(ssu?.tax || 0)
    //             .div(100)
    //             .plus(1),
    //         ),
    //       ) +
    //         Price.getUnit() +
    //         '/' +
    //         ssu.ssu_unit_name || '-'
    //     )
    //   },
    // },
    {
      Header: t('不含税单价'),
      diyGroupName: t('金额信息'),
      accessor: 'no_tax_price',
      minWidth: 150,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const { price, tax } = cellProps.original
        return (
          <div className='tw-flex tw-items-center'>
            <div>
              {toFixedOrder(
                Big(price || 0).div(
                  Big(tax || 0)
                    .div(100)
                    .plus(1),
                ),
              ) +
                Price.getUnit() +
                '/' +
                getFeeUnitName(cellProps.original)}
            </div>
          </div>
        )
      },
    },
    {
      Header: t('下单金额'),
      diyGroupName: t('金额信息'),
      minWidth: 80,
      accessor: 'order_price',
      Cell: (cellProps) => {
        const { summary } = cellProps.original
        return toFixedOrder(Big(summary?.order_price || 0)) + Price.getUnit()
      },
    },
    {
      Header: t('出库数'),
      diyGroupName: t('商品信息'),
      minWidth: 140,
      id: 'outstock_quantity',
      show: true,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => doubleUnitOutStockText(d),
    },
    {
      Header: t('供应商协作模式'),
      diyGroupName: t('商品信息'),
      minWidth: 140,
      id: 'supplier_cooperate_model_type',
      show: true,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => {
        return CooperateModelMap[
          d?.supplier_cooperate_model_type ||
            Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
        ]
      },
    },
    {
      Header: t('验收状态'),
      diyGroupName: t('商品信息'),
      id: 'accept_status',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => {
        if ((+d.status! & OrderDetail_Status.STATUS_ACCEPT) === 0) {
          return t('未验收')
        } else {
          return t('已验收')
        }
      },
    },
    {
      Header: t('验收数'),
      diyGroupName: t('商品信息'),
      id: `accept_value${shopStore.inspectionCount_code}`,
      minWidth: 100,
      show: shopStore.inspectionCount_code,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => {
        // 2.若商品未验收，订单详情验收数显示为-
        // 3.若商品已验收，订单签收后，将验收数同步至订单详情验收数
        const isAccept = (+d.status! & OrderDetail_Status.STATUS_ACCEPT) !== 0
        if (!isAccept) {
          return '-'
        }
        const quantity = d.accept_value?.calculate?.quantity || ''
        const unitName = d.unit?.name
        return quantity + unitName
      },
    },
    {
      Header: t('退货退款数'),
      diyGroupName: t('商品信息'),
      minWidth: 140,
      id: 'summary.return_refund_value.calculate.quantity',
      show: false,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => {
        return (
          <CellRefund
            value={d.summary?.return_refund_value!}
            unit_name={d.unit?.name!}
          />
        )
      },
    },
    {
      Header: t('仅退款数'),
      diyGroupName: t('商品信息'),
      minWidth: 80,
      id: 'summary.just_refund_value.calculate.quantity',
      show: false,
      accessor: (d: DetailListItem) => (
        <CellRefund
          value={d.summary?.just_refund_value!}
          unit_name={d?.unit?.name!}
        />
      ),
    },
    {
      Header: t('售后金额'),
      diyGroupName: t('金额信息'),
      minWidth: 80,
      id: 'summary.aftersale_price',
      show: false,
      accessor: (d: DetailListItem) =>
        Big(Number(d.summary?.aftersale_price) || 0).toFixed(2) +
        Price.getUnit(),
    },
    // {
    //   Header: t('是否加工品'),
    //   minWidth: 80,
    //   id: 'process',
    //   show: false,
    //   hide: globalStore.isLite,
    //   accessor: (d: Sku) => (d.process || d.need_package_work ? '是' : '否'),
    // },
    {
      Header: t('是否发布生产计划'),
      minWidth: 140,
      id: 'STATUS_IS_CREATE_PRODUCTION_TASK',
      show: false,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => {
        return (+d?.summary?.status! &
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
      accessor: (d: DetailListItem) => {
        return (+d?.summary?.status! &
          OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK) ===
          OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK
          ? '已发布'
          : '未发布'
      },
    },
    {
      Header: t('商品销售额'), // 出库金额+售后金额+优惠金额
      diyGroupName: t('金额信息'),
      minWidth: 80,
      id: 'summary.sale_price',
      show: false,
      accessor: (d: DetailListItem) =>
        toFixedOrder(d.summary?.sale_price || 0) + Price.getUnit(),
    },
    {
      ...(getOrderColumns().find(
        (item) => item.Header === '参考成本金额',
      )! as Column<DetailListItem>),
      diyGroupName: t('金额信息'),
    },
    {
      Header: t('不含税商品销售额'),
      diyGroupName: t('金额信息'),
      minWidth: 80,
      id: 'summary.sale_price_no_tax',
      show: false,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) =>
        d.summary?.sale_price_no_tax + Price.getUnit(),
    },
    {
      Header: t('税额'),
      diyGroupName: t('金额信息'),
      minWidth: 80,
      id: 'tax_price',
      show: false,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) =>
        toFixedOrder(+(d?.tax_price || 0)) + Price.getUnit(),
    },
    {
      Header: t('税率'),
      diyGroupName: t('商品信息'),
      minWidth: 80,
      id: 'tax',
      show: false,
      hide: globalStore.isLite,
      accessor: (d: DetailListItem) => (d?.tax || 0) + '%',
    },
    {
      Header: t('备注'),
      diyGroupName: t('商品信息'),
      minWidth: 120,
      id: 'remark',
      accessor: (d: DetailListItem) => (
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
      Header: t('操作'),
      diyGroupName: t('商品信息'),
      minWidth: 120,
      hide: globalStore.isLite,
      id: 'op',
      accessor: (d: DetailListItem, index: number) => {
        // 看看这个商品属于什么类型
        let res
        if (!d?.is_bom_type) {
          res =
            (+d?.summary?.status! &
              OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK) ===
            OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK
        } else {
          res =
            (+d?.summary?.status! &
              OrderDetail_Status.STATUS_IS_CREATE_PRODUCTION_TASK) ===
            OrderDetail_Status.STATUS_IS_CREATE_PRODUCTION_TASK
        }
        if (isCombineSku(d)) {
          return '-'
        }
        return !res ? (
          <a onClick={() => setPublishPurchase(true, index)}>{t('发布')}</a>
        ) : (
          '-'
        )
      },
    },
  ]
}

const ViewList = () => {
  const memorizedColumns = useMemo(() => getColumns(), [])
  const { list, isRanking, setPublishPurchase, publishPurchase, index } = store

  // if (isRanking) {
  return (
    <>
      <Table<DetailListItem>
        isSort={isRanking}
        isDiy={!isRanking}
        keyField='sort_num'
        key={list.map((v) => v?.sort_num).join('')}
        columns={memorizedColumns}
        data={list.slice()}
        id='order_view'
        onSortChange={(newData: DetailListItem[]) => {
          store.setList(newData)
        }}
        isTrHighlight={
          !isRanking
            ? (original, index) =>
                isCombineSku(original as DetailListItem) || original.parentId
            : () => false
        }
        trHighlightClass={
          !isRanking
            ? (original, index) =>
                classNames('b-combine-goods-lr', {
                  'b-combine-goods-top': isCombineSku(
                    original as DetailListItem,
                  ),
                  'b-combine-goods-bottom':
                    original.parentId && !list[index + 1]?.parentId,
                })
            : ' '
        }
      />
      <Drawer
        title={
          <DrawerTitle
            isDetail
            title={t(
              list[index].is_bom_type ? '发布加工品计划' : '发布非加工品计划',
            )}
          />
        }
        visible={publishPurchase}
        width='800px'
        destroyOnClose
        bodyStyle={{ marginBottom: '42px' }}
        onClose={() => setPublishPurchase(false)}
      >
        {list[index].is_bom_type ? (
          <ProcessedProductPlan onClose={() => setPublishPurchase(false)} />
        ) : (
          <NotProcessedProductPlan onClose={() => setPublishPurchase(false)} />
        )}
      </Drawer>
    </>
  )
}

export default observer(ViewList)
