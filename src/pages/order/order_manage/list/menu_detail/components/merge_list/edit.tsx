import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Price, Popover } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import SVGAnomaly from '@/svg/triangle-warning.svg'

import CellImage from '../../../../../components/cell_image'
import store from '../../store'
import globalStore from '@/stores/global'
import { Sku, Ssu } from '../../../../components/interface'
import { toFixedOrder } from '@/common/util'
import { getImages } from '@/common/service'
import CellPrice from '../../../../components/cell_price'
import CellStdQuantity from '../../../../components/cell_std_quantity'
import CellRealQuantity from '../../../../components/cell_real_quantity'
import CellTax from '../../../../components/cell_tax'
import { getOrderColumns } from '@/pages/order/order_manage/list/view_sku/components/list'

import {
  getEndlessPrice,
  calculateSalePrice,
  getOrderUnitName,
  getFeeUnitName,
  toBasicUnit,
} from '@/pages/order/util'
import { handleUnitName } from '@/pages/order/order_manage/components/detail/util'
import LineText from '@/pages/order/components/line_text'

const EditList = () => {
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
          Cell: (cellProps) => {
            const { name, detail_status } = cellProps.original
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
                    <span className='gm-text-red gm-margin-left-5'>
                      <SVGAnomaly />
                    </span>
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
            const { unit } = cellProps.original
            return unit?.name || '-'
          },
        },
        {
          Header: t('下单数'),
          id: 'quantity',
          minWidth: 120,
          diyEnable: false,
          accessor: (d) => {
            return (
              <div>
                {toFixedOrder(Big(d.quantity || 0)) + (d.unit?.name || '-')}
              </div>
            )
          },
        },
        getOrderColumns().find((item) => item.Header === '参考成本单价'),
        {
          Header: t('单价'),
          accessor: 'price',
          minWidth: 120,
          isKeyboard: true,
          diyEnable: false,
          Cell: (cell) => {
            return (
              <Observer>
                {() => {
                  const { original, index } = cell
                  function handleChance<T extends keyof Sku>(
                    index: number,
                    key: T,
                    value: Sku[T],
                  ): void {
                    store.updateRowItem(index, key, value)
                    /** 所有下单同商品价格更新 */
                    store.updateCombineSkuPrice(
                      original.sku_id!,
                      original.unit_id!,
                    )
                  }
                  return (
                    <CellPrice
                      index={index}
                      sku={original}
                      onChange={handleChance}
                    />
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('不含税单价'),
          accessor: 'price_with_no_tax',
          minWidth: 120,
          diyEnable: false,
          Cell: (cell) => {
            return (
              <Observer>
                {() => {
                  const ssu = cell.original

                  return (
                    <div>
                      {toFixedOrder(
                        Big(ssu?.price || 0).div(
                          Big(ssu?.tax || 0)
                            .div(100)
                            .plus(1),
                        ),
                      ) +
                        Price.getUnit() +
                        '/' +
                        handleUnitName(cell.original)}
                    </div>
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('下单金额'),
          minWidth: 80,
          accessor: 'order_price',
          Cell: (cell) => {
            return (
              <Observer>
                {() => {
                  const {
                    quantity,
                    price,
                    fee_unit_id,
                    unit_id,
                    units,
                    unit_cal_info,
                  } = cell.original
                  const unitGroup = units || unit_cal_info?.unit_lists

                  let order_price = ''
                  if (!unitGroup || !unit_id) return <span>-</span>
                  order_price = toFixedOrder(
                    Big(
                      toBasicUnit(quantity || '0', cell.original, 'quantity'),
                    ).times(toBasicUnit(price || '0', cell.original, 'price')),
                  )

                  return (
                    <div>
                      {quantity && unit_id && fee_unit_id
                        ? order_price + Price.getUnit()
                        : '0.00' + Price.getUnit()}
                    </div>
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('出库数'),
          minWidth: 140,
          id: 'std_quantity',
          show: true,
          Cell: (cell) => {
            return (
              <Observer>
                {() => {
                  const { original, index } = cell
                  return (
                    <CellStdQuantity
                      index={index}
                      sku={original}
                      onChange={store.updateRowItem}
                      // isBaseUnit={isBaseUnit}
                    />
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('商品销售额'),
          minWidth: 80,
          id: 'summary.sale_price',
          show: false,
          accessor: (d) => {
            return (
              <Observer>
                {() => {
                  return (
                    <div>{calculateSalePrice(d, true) + Price.getUnit()}</div>
                  )
                }}
              </Observer>
            )
          },
        },
        getOrderColumns().find((item) => item.Header === '参考成本金额'),
        {
          Header: t('不含税商品销售额'),
          minWidth: 100,
          id: 'summary.sale_price_with_no_tax',
          show: false,
          accessor: (d) => {
            return (
              <Observer>
                {() => {
                  return <div>{calculateSalePrice(d) + Price.getUnit()}</div>
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('税额'),
          minWidth: 160,
          accessor: 'tax_price',
          show: true,
          Cell: (cellProps) => {
            return (
              <Observer>
                {() => {
                  const sku = cellProps.original
                  return (
                    <div>
                      {toFixedOrder(
                        Big(calculateSalePrice(sku))
                          .times(sku?.tax || 0)
                          .div(100),
                      ) + Price.getUnit()}
                    </div>
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('税率'),
          minWidth: 120,
          accessor: 'tax',
          show: true,
          isKeyboard: true,
          Cell: (cellProps) => (
            <CellTax
              index={cellProps.index}
              sku={cellProps.original}
              onChange={(value) => {
                store.updateRowItem(cellProps.index, 'tax', value)
              }}
            />
          ),
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
    <Table
      isDiy
      isKeyboard
      isEdit
      columns={columns}
      data={list.slice()}
      id='merge_order_edit'
    />
  )
}

export default observer(EditList)
