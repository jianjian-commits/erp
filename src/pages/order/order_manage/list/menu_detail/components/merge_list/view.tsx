import React, { useEffect, useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Price, Popover } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import CellImage from '../../../../../components/cell_image'
import store from '../../store'
import { Sku } from '../../../../components/interface'
import { toFixedOrder } from '@/common/util'
import { getImages } from '@/common/service'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import { gmHistory as history } from '@gm-common/router'
import { OrderDetail_Status } from 'gm_api/src/order'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import {
  getEndlessPrice,
  getFeeUnitName,
  getOrderUnitName,
} from '@/pages/order/util'
import { getOrderDetailBySsu } from '@/pages/order/order_manage/list/menu_detail/util'
import { getOrderColumns } from '@/pages/order/order_manage/list/view_sku/components/list'
import LineText from '@/pages/order/components/line_text'

type CooperateModelMapType = {
  [key in Sku_SupplierCooperateModelType]: string
}

const CooperateModelMap: CooperateModelMapType = {
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

const ViewList = () => {
  const { order_details } = store.order.order_details || {}
  const columns = useMemo(
    () =>
      [
        {
          Header: t('序号'),
          accessor: 'sort_num',
          minWidth: 50,
        },
        {
          Header: t('商品图'),
          accessor: 'img',
          minWidth: 80,
          Cell: (cellProps) => (
            <CellImage
              img={
                getImages(cellProps.original.repeated_field?.images || [])[0]
                  ?.url
              }
            />
          ),
        },
        {
          Header: t('商品编码'),
          accessor: 'customize_code',
          minWidth: 120,
          diyEnable: false,
        },
        {
          Header: t('商品名'),
          accessor: 'name',
          minWidth: 150,
          diyItemText: t('商品名'),
          diyEnable: false,
          Cell: (props) => {
            const { name, detail_status } = props.original
            const { serial_no } = store.order
            if (+detail_status! & (1 << 12)) {
              return (
                <div className='gm-inline'>
                  {name}
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
            return <span>{name}</span>
          },
        },
        // {
        //   Header: t('规格'),
        //   accessor: 'unit',
        //   minWidth: 120,
        //   Cell: (props) => {
        //     const { unit } = props.original
        //     const text = unit.parent_id
        //       ? `${unit?.rate}${globalStore.getUnitName(unit?.parent_id)}/${
        //           unit?.name
        //         }`
        //       : '-'
        //     return <span>{text}</span>
        //   },
        // },
        {
          Header: t('分类'),
          minWidth: 100,
          diyItemText: t('分类'),
          accessor: 'category_name',
        },
        {
          Header: t('报价单简称（对外）'),
          minWidth: 150,
          accessor: 'quotationName',
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
          Header: t('下单单位'),
          accessor: 'unit_id',
          width: 120,
          diyEnable: false,
          Cell: (cellProps) => {
            const { parentUnit, unit } = cellProps.original
            return getOrderUnitName(parentUnit, unit!)
          },
        },
        {
          Header: t('下单数'),
          accessor: 'quantity',
          minWidth: 120,
          diyEnable: false,
          Cell: (props) => {
            const { unit, quantity } = props.original
            return toFixedOrder(quantity!) + (unit?.name || '-')!
          },
        },
        // {
        //   Header: t('单价（计量单位）'),
        //   accessor: 'std_price',
        //   minWidth: 120,
        //   Cell: (cellProps) => {
        //     const ssu = cellProps.original
        //     const price = toFixedOrder(
        //       Big(ssu?.price || 0).div(ssu.ssu_unit_rate || 1),
        //     )
        //     if (!price && ssu.basic_price?.current_price) {
        //       return <div>{t('时价')}</div>
        //     }
        //     return (
        //       (price || 0) +
        //       Price.getUnit() +
        //       '/' +
        //       (ssu?.ssu_unit_parent_name || '-')
        //     )
        //   },
        // },
        getOrderColumns().find((item) => item.Header === '参考成本单价'),
        // {
        //   Header: t('不含税单价（计量单位）'),
        //   accessor: 'std_price_with_no_tax',
        //   minWidth: 120,
        //   Cell: (cellProps) => {
        //     const ssu = cellProps.original
        //     const price = toFixedOrder(
        //       Big(ssu?.price || 0).div(ssu.ssu_unit_rate || 1),
        //     )
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
        {
          Header: t('单价'),
          accessor: 'price',
          minWidth: 120,
          diyEnable: false,
          Cell: (cell) => {
            const { price, basic_price } = cell.original
            if (!price && basic_price?.current_price) {
              return <div>{t('时价')}</div>
            }
            return (
              toFixedOrder(price || 0) +
              Price.getUnit() +
              '/' +
              getFeeUnitName(cell.original)
            )
          },
        },
        {
          Header: t('不含税单价'),
          accessor: 'price_with_no_tax',
          minWidth: 120,
          diyEnable: false,
          Cell: (cell) => {
            const { price, basic_price, tax } = cell.original
            if (!price && basic_price?.current_price) {
              return <div>{t('时价')}</div>
            }
            return (
              toFixedOrder(
                Big(price || 0).div(
                  Big(tax || 0)
                    .div(100)
                    .plus(1),
                ),
              ) +
              Price.getUnit() +
              '/' +
              getFeeUnitName(cell.original)
            )
          },
        },
        {
          Header: t('下单金额'),
          minWidth: 80,
          accessor: 'order_price',
          Cell: (cell) => {
            // 直接拿后台计算的展示吧
            const sku = cell.original
            const order = getOrderDetailBySsu(sku, order_details || [])
            return (
              <div>
                {toFixedOrder(order?.order_price || 0) + Price.getUnit()}
              </div>
            )
          },
        },
        // {
        //   Header: t('出库数（计量单位）'),
        //   minWidth: 140,
        //   id: 'std_real_quantity_fe',
        //   show: true,
        //   accessor: (d) => {
        //     return (
        //       toFixedOrder(d.std_real_quantity_fe!) + d.ssu_unit_parent_name!
        //     )
        //   },
        // },
        {
          Header: t('出库数'),
          minWidth: 140,
          id: 'std_quantity',
          show: false,
          accessor: (d) => {
            return toFixedOrder(d.std_quantity!) + (d.unit?.name || '-')!
          },
        },
        {
          Header: t('商品销售额'),
          minWidth: 80,
          id: 'sale_price',
          show: false,
          accessor: (d) => {
            const order = getOrderDetailBySsu(d, order_details || [])

            const sale_price = toFixedOrder(Big(order?.sale_price || 0))
            return <div>{sale_price + Price.getUnit()}</div>
          },
        },
        getOrderColumns().find((item) => item.Header === '参考成本金额'),
        {
          Header: t('不含税商品销售额'),
          minWidth: 80,
          id: 'sale_price_no_tax',
          show: false,
          accessor: (d) => {
            const order = getOrderDetailBySsu(d, order_details || [])
            const sale_price = toFixedOrder(Big(order?.sale_price_no_tax || 0))
            return <div>{sale_price + Price.getUnit()}</div>
          },
        },
        {
          Header: t('税额'),
          minWidth: 80,
          id: 'tax_price',
          show: false,
          accessor: (d) => {
            const order = getOrderDetailBySsu(d, order_details || [])
            const tax_price = toFixedOrder(Big(order?.tax_price || 0))
            return <div>{tax_price + Price.getUnit()}</div>
          },
        },
        {
          Header: t('税率'),
          minWidth: 80,
          id: 'tax',
          show: false,
          accessor: (d) => (d?.tax || 0) + '%',
        },
        {
          Header: t('退货退款数'),
          minWidth: 100,
          id: 'return_refund_value.calculate.quantity',
          show: false,
          accessor: (d) => {
            return (
              <div>
                {Big(d?.return_refund_value?.calculate?.quantity || 0).toFixed(
                  2,
                ) + (d?.unit?.name || '-')}
              </div>
            )
          },
        },
        {
          Header: t('验收状态'),
          minWidth: 140,
          id: 'inspection_id',
          accessor: (d) => {
            const order = getOrderDetailBySsu(d, order_details || [])
            if ((+order?.status! & OrderDetail_Status.STATUS_ACCEPT) === 0) {
              return t('未验收')
            } else {
              return t('已验收')
            }
          },
        },
        {
          Header: t('供应商协作模式'),
          minWidth: 140,
          id: 'supplier_cooperate_model_type',
          accessor: (d) => {
            const { order_details } = store.order.order_details
            const order = _.find(
              order_details,
              (o) => o?.sku_id === d.sku_id && o?.unit_id === d.unit_id,
            )
            return (
              <div>
                {
                  CooperateModelMap[
                    (order.supplier_cooperate_model_type as Sku_SupplierCooperateModelType) ||
                      Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
                  ]
                }
              </div>
            )
          },
        },
        {
          Header: t('验收数'),
          id: `accept_value${shopStore.inspectionCount_code}`,
          minWidth: 100,
          show: shopStore.inspectionCount_code,
          accessor: (ssu) => {
            const d = getOrderDetailBySsu(ssu, order_details || [])
            // 2.若商品未验收，订单详情验收数显示为-
            // 3.若商品已验收，订单签收后，将验收数同步至订单详情验收数
            const isAccept =
              (+d?.status! & OrderDetail_Status.STATUS_ACCEPT) !== 0
            if (!isAccept) {
              return '-'
            }
            const quantity = d?.accept_value?.calculate?.quantity || ''
            const unitName = d?.unit.name || '-'
            return quantity + unitName
          },
        },
        {
          Header: t('仅退款数'),
          minWidth: 100,
          id: 'just_refund_value.calculate.quantity',
          show: false,
          accessor: (d) => {
            return (
              <div>
                {Big(d?.just_refund_value?.calculate?.quantity || 0).toFixed(
                  2,
                ) + (d?.unit?.name || '-')}
              </div>
            )
          },
        },
        {
          Header: t('售后金额'),
          minWidth: 80,
          id: 'order_price',
          show: false,
          accessor: (d) => {
            return (
              <div>
                {toFixedOrder(Big(d?.aftersale_price || 0)) + Price.getUnit()}
              </div>
            )
          },
        },
        {
          Header: t('备注'),
          minWidth: 120,
          id: 'remark',
          accessor: (d) => d.remark || '-',
        },
      ] as Column<Sku>[],
    [],
  )
  const { list } = store

  return (
    <Table isDiy columns={columns} data={list.slice()} id='menu_order_view' />
  )
}

export default observer(ViewList)
