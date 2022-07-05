import React, { useCallback, useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { Flex, Price, Popover, Select } from '@gm-pc/react'
import { Observer, observer } from 'mobx-react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import SVGAnomaly from '@/svg/triangle-warning.svg'

import CellImage from '../../../../../components/cell_image'
import store from '../../store'
import { Sku } from '../../../../components/interface'
import { toFixedOrder } from '@/common/util'
import { getImages } from '@/common/service'
import CellSsu from './cell_ssu'
import CellOperation from './cell_operation'
import CellQuantity from './cell_quantity'
import CellIngredients from './cell_ingredients'
import globalStore from '@/stores/global'
import { useMount } from 'react-use'
import { getFeeUnitName, isCombineSku, toBasicUnit } from '@/pages/order/util'
import {
  getFeePriceByUnit,
  handleUnitName,
} from '@/pages/order/order_manage/components/detail/util'
import { toJS } from 'mobx'

const { OperationHeader, TABLE_X } = TableXUtil

const EditList = () => {
  useMount(globalStore.fetchOrderSetting)
  const handleAddItem = useCallback(() => {
    store.addMenuListRow()
  }, [])

  const columns = useMemo(
    () =>
      [
        {
          Header: t('序号'),
          id: 'index',
          width: TableXUtil.TABLE_X.WIDTH_NO,
          Cell: (cellProps) => cellProps.index + 1,
        },
        {
          Header: OperationHeader,
          id: 'operation',
          fixed: 'left',
          width: TABLE_X.WIDTH_EDIT_OPERATION,
          Cell: (cellProps) => <CellOperation index={cellProps.index} />,
        },
        {
          Header: t('商品图'),
          accessor: 'imgs',
          width: 70,
          Cell: (cellProps) => (
            <Observer>
              {() => (
                <CellImage
                  img={
                    getImages(
                      cellProps.original.repeated_field?.images || [],
                    )[0]?.url
                  }
                />
              )}
            </Observer>
          ),
        },
        {
          Header: t('商品编码'),
          accessor: 'customize_code',
          width: 140,
          diyEnable: false,
          Cell: (cellProps) => (
            <Observer>
              {() => <div>{cellProps.original.customize_code}</div>}
            </Observer>
          ),
        },
        {
          Header: t('商品名'),
          accessor: 'name',
          width: 280,
          diyEnable: false,
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <Flex alignCenter>
                <CellSsu
                  sku={cellProps.original}
                  index={cellProps.index}
                  status={cellProps.original?.detail_status}
                />
                <CellIngredients
                  sku={cellProps.original}
                  index={cellProps.index}
                  status={cellProps.original?.detail_status}
                />
                {+cellProps.original?.detail_status! & (1 << 12) ? (
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
                ) : (
                  ''
                )}
              </Flex>
            )
          },
        },
        {
          Header: t('下单单位'),
          accessor: 'unit_id',
          width: 200,
          diyEnable: false,
          // Cell: (cellProps) => {
          //   const { parentUnit, unit } = cellProps.original
          //   return getOrderUnitName(parentUnit, unit!)
          // },
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  units,
                  unit_id,
                  prices,
                  sku_id,
                  unit,
                  isNewItem,
                  parentId,
                } = cellProps.original
                // 编辑订单不能修改下单单位

                return (
                  // @ts-ignore
                  <Select
                    disabled={
                      isNewItem
                        ? false
                        : !!(parentId || isCombineSku(cellProps.original))
                    }
                    // data={
                    //   !isNewItem
                    //     ? [{ text: unit?.name, value: unit?.unit_id }]
                    //     : units
                    // }
                    data={units}
                    value={unit_id}
                    onChange={(v) => {
                      const minimum_order_number = prices?.find(
                        (item) => item.order_unit_id === v,
                      )?.minimum_order_number
                      const { price, fee_unit_id } = getFeePriceByUnit(
                        v,
                        prices,
                        units,
                      )
                      const unit = units?.find(
                        (unit) => unit.unit_id === v || unit.value === v,
                      )
                      const updates = {
                        unit_id: v,
                        // 用来展示下单单位名称
                        unit: { ...unit, name: unit.text },
                        minimum_order_number,
                        price,
                        fee_unit_id,
                        quantity: minimum_order_number || 1,
                      }
                      // store.updateRow(cellProps.index, {
                      //   ...cellProps.original,
                      //   ...updates,
                      // })
                      store.updateMenuListRow(cellProps.index, {
                        ...cellProps.original,
                        ...updates,
                      })

                      // 删除的话，不需要管skuMap
                      // 在没有通过分拣或订单修改出库数的时候，修改下单数自动同步出库数；修改了出库数后，再修改下单数，不会自动同步“出库数”
                      store.updateMergeSku(
                        toJS(
                          store.menuList.filter((v) => v.sku_id && v.unit_id),
                        ),
                        store.skuMap,
                        undefined,
                        store.list,
                        globalStore.orderSetting,
                      )
                    }}
                    placeholder={t('请选择下单单位')}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('下单数'),
          accessor: 'quantity',
          width: 250,
          diyEnable: false,
          isKeyboard: true,
          Cell: (props) => {
            const { detail_status } = props.original
            const sku = props.original
            return (
              <CellQuantity
                sku={sku}
                index={props.index}
                status={detail_status}
              />
            )
          },
        },
        {
          Header: t('单价'),
          accessor: 'price',
          minWidth: 120,
          diyEnable: false,
          Cell: (cell) => {
            return (
              <Observer>
                {() => {
                  const sku = cell.original
                  const { price, unit } = sku
                  const feeUnitName = isCombineSku(sku)
                    ? unit?.name || '-'
                    : handleUnitName(sku)
                  return (
                    <div>
                      {toFixedOrder(Big(price || 0)) +
                        Price.getUnit() +
                        '/' +
                        feeUnitName}
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
          Cell: (cell) => (
            <Observer>
              {() => {
                const sku = cell.original
                const {
                  quantity,
                  price,
                  fee_unit_id,
                  unit_id,
                  units,
                  unit_cal_info,
                } = sku
                const unitGroup = units || unit_cal_info?.unit_lists
                let order_price = ''
                if (isCombineSku(sku)) {
                  return (
                    <div>
                      {toFixedOrder(Big(quantity || 0).times(price || 0)) +
                        Price.getUnit()}
                    </div>
                  )
                } else if (!unitGroup || !unit_id) {
                  return <span>-</span>
                } else {
                  order_price = toFixedOrder(
                    Big(toBasicUnit(quantity || '0', sku, 'quantity')).times(
                      toBasicUnit(price || '0', sku, 'price'),
                    ),
                  )
                }
                return (
                  <div>
                    {quantity && unit_id && fee_unit_id
                      ? order_price + Price.getUnit()
                      : '0.00' + Price.getUnit()}
                  </div>
                )
              }}
            </Observer>
          ),
        },
      ] as Column<Sku>[],
    [],
  )
  const { menuList } = store

  return (
    <Table
      isDiy
      isKeyboard
      isEdit
      onAddRow={handleAddItem}
      columns={columns}
      data={menuList.slice()}
      id='menu_order_edit'
    />
  )
}

export default observer(EditList)
