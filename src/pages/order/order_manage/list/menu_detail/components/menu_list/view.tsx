import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { Flex, Price, Popover } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'

import CellImage from '../../../../../components/cell_image'
import store from '../../store'
import { Sku } from '../../../../components/interface'
import { toFixedOrder } from '@/common/util'
import { getImages } from '@/common/service'
import CellIngredients from './cell_ingredients'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import { gmHistory as history } from '@gm-common/router'
import { getFeeUnitName, getOrderUnitName } from '@/pages/order/util'

const EditList = () => {
  const columns: Column<Sku>[] = useMemo(
    () => [
      {
        Header: t('序号'),
        id: 'index',
        width: TableXUtil.TABLE_X.WIDTH_NO,
        Cell: (cellProps) => cellProps.index + 1,
      },
      {
        Header: t('商品图'),
        accessor: 'img',
        width: 70,
        Cell: (cellProps) => (
          <CellImage
            img={
              getImages(cellProps.original.repeated_field?.images || [])[0]?.url
            }
          />
        ),
      },
      {
        Header: t('商品编码'),
        accessor: 'customize_code',
        width: 140,
        diyEnable: false,
      },
      {
        Header: t('商品名'),
        accessor: 'name',
        minWidth: 150,
        diyItemText: t('商品名'),
        diyEnable: false,
        Cell: (props) => {
          const { detail_status } = props.original
          const sku = props.original
          const index = props.index
          const { serial_no } = store.order
          return (
            <Flex alignCenter>
              {sku.name}
              <CellIngredients sku={sku} index={index} />
              {+detail_status! & (1 << 12) ? (
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
              ) : (
                ''
              )}
            </Flex>
          )
        },
      },
      {
        Header: t('下单数'),
        accessor: 'quantity',
        minWidth: 120,
        diyEnable: false,
        Cell: (cellProps) => {
          const { quantity, unit } = cellProps.original
          return toFixedOrder(Big(quantity || 0)) + unit?.name || '-'
        },
      },
      {
        Header: t('下单单位'),
        accessor: 'unit_id',
        minWidth: 120,
        diyEnable: false,
        Cell: (cellProps) => {
          const { parentUnit, unit } = cellProps.original
          return getOrderUnitName(parentUnit, unit!)
        },
      },
      {
        Header: t('单价'),
        accessor: 'price',
        minWidth: 120,
        diyEnable: false,
        Cell: (cellProps) => {
          const { price } = cellProps.original
          return (
            toFixedOrder(Big(price || 0)) +
            Price.getUnit() +
            '/' +
            getFeeUnitName(cellProps.original)
          )
        },
      },
      {
        Header: t('下单金额'),
        minWidth: 80,
        accessor: 'order_price',
        Cell: (cell) =>
          toFixedOrder(Big(cell.original?.summary?.order_price || 0)) +
          Price.getUnit(),
      },
    ],
    [],
  )
  const { menuList } = store

  return (
    <Table
      isDiy
      isKeyboard
      isEdit
      columns={columns}
      data={menuList.slice()}
      id='menu_order_edit'
    />
  )
}

export default observer(EditList)
