import { t } from 'gm-i18n'
import React, { useMemo, useCallback, useEffect } from 'react'
import { Flex, Popover, Price, Select } from '@gm-pc/react'
import { is } from '@gm-common/tool'
import Big from 'big.js'
import { TableXUtil, Table, Column, TableXDataItem } from '@gm-pc/table-x'
import { observer, Observer } from 'mobx-react'
import { KCSelect } from '@gm-pc/keyboard'
import {
  Quotation_Type,
  Sku_SupplierCooperateModelType,
  Unit,
  UnitType,
} from 'gm_api/src/merchandise'
import { OrderDetail_Status, Order_Type } from 'gm_api/src/order'

import Operation from './components/edit_operation'
import CellImage from '../../../../components/cell_image'
import CellSkuSelector from './components/cell_sku_selector'
import CellQuantity from './components/cell_quanlity'
import CellSalePrice from './components/cell_sale_price'
import CellOutStockQuantity from './components/cell_outstock_quantity'
import CellRemark from './components/cell_remark'
import CellRefund from './components/cell_refund'
import CellTax from '../../cell_tax'
import store from '../store'
import globalStore from '@/stores/global'
import { convertUnit, toFixedOrder } from '@/common/util'
import { getListImages } from '@/common/service'
import {
  getEndlessPrice,
  calculateSalePrice,
  toBasicUnit,
  isCombineSku,
  transformOutStock,
} from '@/pages/order/util'
import { getColumns as getViewColumns } from './view'
import { useMount } from 'react-use'
import _ from 'lodash'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import {
  getFeePriceByUnit,
  handleUnitName,
} from '@/pages/order/order_manage/components/detail/util'
import { App_Type } from 'gm_api/src/common'
import './style.less'
import LineText from '@/pages/order/components/line_text'
import CellIngredients from './components/cell_ingredients'
import CellPrint from '@/pages/order/order_manage/components/cell_print'
import CellInputNumber from '@/pages/order/order_manage/components/cell_input_number'
import SalePriceNoTaxCell from '@/pages/order/order_manage/components/detail/list/components/cell_sale_price_no_tax'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'
import { Select as ASelect, Popover as APopover, Dropdown, Menu } from 'antd'
import CurrentSellPriceTable from '@/pages/order/order_manage/list/components/popover/current_sell_price_table'
import SvgPriceReference from '@/svg/price-reference.svg'
import triangle_down from '@/img/triangle_down.png'
import { openHistoryPriceModal } from '@/pages/merchandise/components/history_price_modal'
import { createPortal } from 'react-dom'
import SvgFall from '@/svg/fall.svg'
import OrderReferencePriceMap from '@/pages/order/order_manage/components/order_reference_price_map'
import Filter from '@/svg/filter.svg'

const { OperationHeader, TABLE_X } = TableXUtil

const getColumns = (): Column<DetailListItem>[] => {
  const isEdit = store.order.view_type === 'edit'
  const isNotCreate = store.order.view_type !== 'create'

  // ??????????????????????????????
  const hideFakeOrderCell = [
    // ?????????
    globalStore.isLite,
    // ????????????
    store.order.quotation_type === Quotation_Type.WITH_TIME,
    // ??????????????????
    !globalStore.hasPermission(
      Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
    ),
  ].includes(true)

  return [
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      id: 'index',
      width: TABLE_X.WIDTH_NO,
      fixed: is.phone() ? undefined : 'left',
      Cell: (cellProps) => cellProps.index + 1,
    },
    {
      Header: OperationHeader,
      diyGroupName: t('????????????'),
      diyItemText: '??????',
      id: 'operation',
      fixed: 'left',
      width: TABLE_X.WIDTH_EDIT_OPERATION,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const { index } = cellProps
            const { parentId, ingredientsInfo = [] } = cellProps.original
            return !parentId ? (
              <Operation
                index={index}
                ingredientsCount={ingredientsInfo.length}
              />
            ) : null
          }}
        </Observer>
      ),
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      accessor: 'imgs',
      width: 70,
      fixed: is.phone() ? undefined : 'left',
      Cell: (cellProps) => (
        <Observer>
          {() => (
            <CellImage
              img={
                getListImages(
                  cellProps.original.repeated_field?.images || [],
                )[0]?.url
              }
            />
          )}
        </Observer>
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: 'customize_code',
      width: 100,
      fixed: is.phone() ? undefined : 'left',
      diyEnable: false,
      Cell: (cellProps) => (
        <Observer>
          {() => <div>{cellProps.original.customize_code}</div>}
        </Observer>
      ),
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      accessor: 'name',
      width: globalStore.isLite ? 180 : 280,
      minWidth: globalStore.isLite ? 180 : 280,
      fixed: is.phone() ? undefined : 'left',
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => {
        return (
          <Flex alignCenter>
            <CellSkuSelector sku={cellProps.original} index={cellProps.index} />
            <CellIngredients sku={cellProps.original} index={cellProps.index} />
          </Flex>
        )
      },
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: 'unit_id',
      width: 140,
      fixed: is.phone() ? undefined : 'left',
      // hide: !globalStore.isLite,
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              units,
              unit_id,
              prices,
              quantity,
              unit,
              isNewItem,
              parentId,
              withoutInQuotations,
              isUsingSecondUnitOutStock,
              second_base_unit_id,
              base_unit_id,
              tax,
            } = cellProps.original
            const currentUnit = _.find(units, (v) => v.unit_id === unit_id)
            // ????????????????????????????????????
            return (
              <KCSelect
                disabled={
                  parentId ||
                  store.type === App_Type.TYPE_ESHOP ||
                  // type === 5??????????????????????????????????????????????????????????????????
                  (globalStore.isLite &&
                    (currentUnit?.type === UnitType.SSU_UNIT_ANCHOR ||
                      currentUnit?.group_id !== '0'))
                }
                // ??????sku??????????????????
                data={
                  isEdit && !units
                    ? [{ value: unit_id, text: unit?.name || '' }]
                    : units
                }
                value={unit_id}
                onChange={(v) => {
                  if (v === unit_id) return
                  let updates = {}
                  const unit = units?.find(
                    (unit) => unit.unit_id === v || unit.value === v,
                  )
                  const sameGroupWithSecondUnit = globalStore.isSameUnitGroup(
                    v,
                    second_base_unit_id!,
                  )
                  // ???????????????
                  const minimum_order_number = prices?.find(
                    (item) => item.order_unit_id === v,
                  )?.minimum_order_number
                  // ?????????????????????
                  if (isUsingSecondUnitOutStock) {
                    // ??????????????????????????????????????????????????????
                    if (sameGroupWithSecondUnit) {
                      updates = {
                        std_unit_id: base_unit_id,
                        std_unit_id_second: v,
                        std_quantity: minimum_order_number
                          ? toFixedOrder(
                              transformOutStock(
                                +minimum_order_number,
                                v,
                                cellProps.original,
                                'FROM_SECONDUNIT',
                              ),
                            )
                          : '',
                        std_quantity_second: minimum_order_number,
                      }
                    } else {
                      updates = {
                        std_unit_id: v,
                        std_unit_id_second: second_base_unit_id,
                        std_quantity: minimum_order_number || '',
                        std_quantity_second: minimum_order_number
                          ? toFixedOrder(
                              transformOutStock(
                                +minimum_order_number,
                                v,
                                cellProps.original,
                                'TO_SECONDUNIT',
                              ),
                            )
                          : '',
                      }
                    }
                  } else {
                    updates = {
                      std_unit_id: v,
                      std_quantity: minimum_order_number || '',
                    }
                  }
                  if (!withoutInQuotations) {
                    const { price, fee_unit_id, no_tax_price } =
                      getFeePriceByUnit(v, prices!, units!, tax!)
                    Object.assign(updates, {
                      unit_id: v,
                      // ??????????????????????????????
                      unit,
                      minimum_order_number,
                      price,
                      no_tax_price,
                      fee_unit_id,
                      quantity: minimum_order_number,
                    })
                  } else {
                    // ?????????????????????????????????????????????sku
                    Object.assign(updates, {
                      unit_id: v,
                      // ??????????????????????????????
                      unit,
                      minimum_order_number: '',
                      price: '',
                      fee_unit_id: v,
                      quantity: '',
                      no_tax_price: '',
                    })
                  }
                  store.resetAddOrderValue(cellProps.index, v)
                  store.updateRow(cellProps.index, {
                    ..._.omit(cellProps.original, [
                      'std_unit_id',
                      'std_unit_id_second',
                    ]),
                    ...updates,
                  })

                  const basic_price = prices?.find(
                    (p) => p.order_unit_id === updates.unit_id,
                  )
                  if (basic_price?.current_price) {
                    // ???????????????????????????
                    store.updateRowItem(cellProps.index, 'price', '')
                  }

                  // if (!quantity)
                  //   store.updateRowItem(
                  //     cellProps.index,
                  //     'quantity',
                  //     minimum_order_number,
                  //   )
                }}
                placeholder={t('?????????????????????')}
              />
            )
          }}
        </Observer>
      ),
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      minWidth: 80,
      accessor: 'category_name',
      hide: globalStore.isLite,
      Cell: (props) => (
        <Observer>
          {() => {
            const { category_name } = props.original
            return <span>{category_name || '-'}</span>
          }}
        </Observer>
      ),
    },
    {
      Header: t('???????????????????????????'),
      diyGroupName: t('????????????'),
      minWidth: 150,
      accessor: 'quotationName',
      hide: globalStore.isLite,
      Cell: (props) => (
        <Observer>
          {() => {
            const {
              menu,
              quotationName = '',
              withoutInQuotations,
            } = props.original
            const value = withoutInQuotations
              ? '-'
              : store.type === App_Type.TYPE_ESHOP
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
          }}
        </Observer>
      ),
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      accessor: 'quantity',
      width: 190,
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => (
        <CellQuantity index={cellProps.index} sku={cellProps.original} />
      ),
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      accessor: 'price',
      width: 190,
      diyEnable: false,
      isKeyboard: true,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            return (
              <div className='tw-flex tw-items-center'>
                <CellSalePrice
                  index={cellProps.index}
                  sku={cellProps.original}
                />
                <div
                  id={`ReferencePriceMap-order-${cellProps.index}`}
                  className='tw-inline-flex tw-items-center'
                />
              </div>
            )
          }}
        </Observer>
      ),
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
                    <div className='gm-padding-10'>{`??????: ${
                      store.priceOf === 'purchase_reference_prices'
                        ? '???????????????'
                        : '???????????????'
                    }`}</div>
                  }
                >
                  <span>????????????</span>
                </Popover>
                <Dropdown
                  trigger='click'
                  overlay={
                    <Menu selectedKeys={[store.priceOf]}>
                      {[
                        {
                          key: 'purchase_reference_prices',
                          label: '???????????????',
                        },
                        {
                          key: 'in_stock_reference_prices',
                          label: '???????????????',
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
      diyGroupName: t('????????????'),
      diyItemText: '????????????',
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
                      val: String(original.price || ''),
                      unit_id: original.unit_id!,
                    },
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('???????????????'),
      id: 'sell_price',
      diyGroupName: t('????????????'),
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
                    <span>{t('???')} </span>
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
                            title: original.name + '-???????????????',
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
                        //   title: original.name + '-???????????????',
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
      Header: t('?????????1'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_value1',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                add_order_value1,
                unit_id = '',
                unit,
                parentId,
              } = cellProps.original
              const disabled =
                isCombineSku(cellProps.original) ||
                !!parentId ||
                store.order.order_type === Order_Type.TYPE_STUDENT
              const val = add_order_value1?.quantity?.val
              return (
                <CellInputNumber
                  disabled={disabled}
                  value={val}
                  onChange={(val) => {
                    const target = store.getRowItem(
                      cellProps.index,
                      'add_order_value1',
                    )
                    store.updateRowItem(cellProps.index, 'add_order_value1', {
                      ...target,
                      quantity: {
                        unit_id,
                        ...target?.quantity,
                        val: _.isNil(val) ? '' : `${val}`,
                      },
                    })
                  }}
                  suffix={unit?.name}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('?????????2'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_value2',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                add_order_value2,
                unit_id = '',
                unit,
                parentId,
              } = cellProps.original
              const disabled =
                isCombineSku(cellProps.original) ||
                !!parentId ||
                store.order.order_type === Order_Type.TYPE_STUDENT
              const val = add_order_value2?.quantity?.val
              return (
                <CellInputNumber
                  disabled={disabled}
                  value={val}
                  onChange={(val) => {
                    const target = store.getRowItem(
                      cellProps.index,
                      'add_order_value2',
                    )
                    store.updateRowItem(cellProps.index, 'add_order_value2', {
                      ...target,
                      quantity: {
                        unit_id,
                        ...target?.quantity,
                        val: _.isNil(val) ? '' : `${val}`,
                      },
                    })
                  }}
                  suffix={unit?.name}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('?????????3'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_value3',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                add_order_value3,
                unit_id = '',
                unit,
                parentId,
              } = cellProps.original
              const disabled =
                isCombineSku(cellProps.original) ||
                !!parentId ||
                store.order.order_type === Order_Type.TYPE_STUDENT
              const val = add_order_value3?.quantity?.val
              return (
                <CellInputNumber
                  disabled={disabled}
                  value={val}
                  onChange={(val) => {
                    const target = store.getRowItem(
                      cellProps.index,
                      'add_order_value3',
                    )
                    store.updateRowItem(cellProps.index, 'add_order_value3', {
                      ...target,
                      quantity: {
                        unit_id,
                        ...target?.quantity,
                        val: _.isNil(val) ? '' : `${val}`,
                      },
                    })
                  }}
                  suffix={unit?.name}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('?????????4'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_value4',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                add_order_value4,
                unit_id = '',
                unit,
                parentId,
              } = cellProps.original
              const disabled =
                isCombineSku(cellProps.original) ||
                !!parentId ||
                store.order.order_type === Order_Type.TYPE_STUDENT
              const val = add_order_value4?.quantity?.val
              return (
                <CellInputNumber
                  disabled={disabled}
                  value={val}
                  onChange={(val) => {
                    const target = store.getRowItem(
                      cellProps.index,
                      'add_order_value4',
                    )
                    store.updateRowItem(cellProps.index, 'add_order_value4', {
                      ...target,
                      quantity: {
                        unit_id,
                        ...target?.quantity,
                        val: _.isNil(val) ? '' : `${val}`,
                      },
                    })
                  }}
                  suffix={unit?.name}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: 'total_add_order_value',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { unit, total_add_order_value } = cellProps.original
              const val = total_add_order_value?.quantity?.val || 0
              return <>{val + (unit?.name || '-')}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: 'is_print',
      width: 80,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                detail_status,
                parentId,
                ingredientsInfo,
                detail_random_id,
              } = cellProps.original
              const disabled =
                !!(+detail_status! & (1 << 12)) ||
                !!parentId ||
                store.type === App_Type.TYPE_ESHOP
              return (
                <CellPrint
                  disabled={disabled}
                  value={cellProps.original.is_print}
                  onChange={(value) => {
                    store.updateRowItem(cellProps.index, 'is_print', value)
                    _.forEach(ingredientsInfo, (item) => {
                      const index = _.findIndex(
                        store.list,
                        (row) =>
                          row.detail_random_id === detail_random_id &&
                          row.sku_id === item.sku_id &&
                          row.unit_id === item.unit_id,
                      )
                      if (index > -1) {
                        store.updateRowItem(index, 'is_print', value)
                      }
                    })
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????1'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_price1',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { add_order_price1 } = cellProps.original
              return <>{(add_order_price1 || 0) + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????2'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_price2',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { add_order_price2 } = cellProps.original
              return <>{(add_order_price2 || 0) + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????3'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_price3',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { add_order_price3 } = cellProps.original
              return <>{(add_order_price3 || 0) + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????4'),
      diyGroupName: t('????????????'),
      accessor: 'add_order_price4',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { add_order_price4 } = cellProps.original
              return <>{(add_order_price4 || 0) + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      accessor: 'total_add_order_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { total_add_order_price } = cellProps.original
              return <>{total_add_order_price + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      accessor: 'fake_order_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        // ??????????????????=?????????+?????????1+?????????2+?????????3+?????????4
        // ??????????????????=?????????????????? * ??????
        return (
          <Observer>
            {() => {
              const { fake_order_price } = cellProps.original
              return <>{fake_order_price + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      accessor: 'fake_outstock_price',
      width: 190,
      show: false,
      diyEnable: true,
      hide: hideFakeOrderCell,
      Cell: (cellProps) => {
        // ??????????????????=?????????+?????????1+?????????2+?????????3+?????????4
        // ??????????????????=?????????????????? * ??????
        return (
          <Observer>
            {() => {
              const { fake_outstock_price } = cellProps.original
              return <>{fake_outstock_price + Price.getUnit()}</>
            }}
          </Observer>
        )
      },
    },
    {
      ...getViewColumns().find((c) => c.Header === t('??????????????????'))!,
      diyGroupName: t('????????????'),
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      accessor: 'no_tax_price',
      minWidth: 150,
      hide: globalStore.isLite,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const sku = cellProps.original
            // TODO ????????????????????????????????????
            if (!sku?.price && sku.basic_price?.current_price)
              return <div>{t('??????')}</div>
            // ??????????????? = ?????? / ???1 + ?????????
            return <SalePriceNoTaxCell sku={sku} index={cellProps.index} />
          }}
        </Observer>
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      minWidth: 80,
      accessor: 'order_price',
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              quantity,
              price,
              fee_unit_id,
              unit_id,
              units,
              unit_cal_info,
            } = cellProps.original
            const unitGroup = units || unit_cal_info?.unit_lists
            let order_price = ''
            if (!unitGroup || !unit_id) return <span>-</span>
            order_price = toFixedOrder(
              Big(
                toBasicUnit(quantity || '0', cellProps.original, 'quantity'),
              ).times(toBasicUnit(price || '0', cellProps.original, 'price')),
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
      ),
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      minWidth: 80,
      accessor: 'summary.return_refund_value.quantity.quantity',
      hide: !isEdit || globalStore.isLite,
      Cell: (props) => (
        <Observer>
          {() => {
            if (!props.original?.unit) {
              return <span>-</span>
            }
            return (
              <CellRefund
                value={props.original.summary?.return_refund_value!}
                unit_name={props.original?.unit.name}
              />
            )
          }}
        </Observer>
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      minWidth: 80,
      hide: !isEdit,
      accessor: 'summary.just_refund_value.quantity.quantity',
      Cell: (props) => (
        <Observer>
          {() => (
            <CellRefund
              value={props.original.summary?.return_refund_value!}
              unit_name={props.original?.unit?.name!}
            />
          )}
        </Observer>
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      minWidth: 80,
      hide: !isEdit,
      accessor: 'summary.aftersale_price',
      Cell: (props) => (
        <Observer>
          {() => {
            const { summary } = props.original
            return (
              <span>
                {Big(Number(summary?.aftersale_price) || 0).toFixed(2) +
                  Price.getUnit()}
              </span>
            )
          }}
        </Observer>
      ),
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      minWidth: 230,
      accessor: 'std_quantity',
      show: true,
      isKeyboard: isEdit,
      hide: globalStore.isLite,
      Cell: (cellProps) => (
        <CellOutStockQuantity
          index={cellProps.index}
          sku={cellProps.original}
        />
      ),
    },
    {
      Header: t('?????????????????????'),
      diyGroupName: t('????????????'),
      minWidth: 160,
      accessor: 'supplier_cooperate_model_type',
      show: true,
      isKeyboard: isEdit,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const d = cellProps.original
              return (
                <Select
                  data={[
                    {
                      value:
                        Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
                      text: t('?????????'),
                    },
                    {
                      value: Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
                      text: t('??????????????????'),
                    },
                    {
                      value: Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
                      text: t('??????????????????'),
                    },
                  ]}
                  disabled={
                    +d?.summary?.status! ===
                      OrderDetail_Status.STATUS_IS_CREATE_PRODUCTION_TASK ||
                    +d?.summary?.status! ===
                      OrderDetail_Status.STATUS_IS_CREATE_PURCHASE_TASK ||
                    store.type === App_Type.TYPE_ESHOP
                  }
                  value={d.supplier_cooperate_model_type}
                  onChange={(v) =>
                    store.updateRowItem(
                      cellProps.index,
                      'supplier_cooperate_model_type',
                      v,
                    )
                  }
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      minWidth: 160,
      accessor: 'summary.sale_price',
      show: true,
      hide: !isNotCreate,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const sku = cellProps.original

              // ????????????????????????
              return (
                <div>{calculateSalePrice(sku, true) + Price.getUnit()}</div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('????????????????????????'), // = ????????? / ???1 + ?????????
      diyGroupName: t('????????????'),
      minWidth: 160,
      accessor: 'summary.sale_price_no_tax',
      show: true,
      hide: !isNotCreate || globalStore.isLite,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const ssu = cellProps.original
              return <div>{calculateSalePrice(ssu) + Price.getUnit()}</div>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      minWidth: 160,
      accessor: 'tax_price',
      show: true,
      hide: !isNotCreate || globalStore.isLite,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const ssu = cellProps.original
              return (
                <div>
                  {toFixedOrder(
                    Big(calculateSalePrice(ssu))
                      .times(ssu?.tax || 0)
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
      Header: t('??????'),
      diyGroupName: t('????????????'),
      minWidth: 120,
      accessor: 'tax',
      show: true,
      isKeyboard: true,
      hide: globalStore.isLite,
      Cell: (cellProps) => (
        <CellTax
          index={cellProps.index}
          sku={cellProps.original}
          onChange={(value) => {
            const { price } = cellProps.original
            store.updateRowItem(cellProps.index, 'tax', value)
            store.updateRowItem(
              cellProps.index,
              'no_tax_price',
              toFixedOrder(
                Big(price || 0).div(
                  Big(value || 0)
                    .div(100)
                    .plus(1),
                ),
              ),
            )
          }}
        />
      ),
    },
    {
      ...getViewColumns().find((c) => c.Header === t('??????????????????'))!,
      diyGroupName: t('????????????'),
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      minWidth: 100,
      accessor: 'remark',
      isKeyboard: true,
      Cell: (cellProps) => (
        <CellRemark index={cellProps.index} sku={cellProps.original} />
      ),
    },
  ]
}

const trHighlightClass = (e: TableXDataItem, index: number) => {
  const classes = e.withoutInQuotations ? 'order-edit-list-highlight' : ''
  return classNames(`b-combine-goods-lr ${classes}`, {
    'b-combine-goods-top': isCombineSku(e as DetailListItem),
    'b-combine-goods-bottom': e.parentId && !store.list[index + 1]?.parentId,
  })
}
const isTrHighlight = (e: TableXDataItem) => {
  return (
    !!e.withoutInQuotations || isCombineSku(e as DetailListItem) || e.parentId
  )
}

const EditList = () => {
  useMount(globalStore.fetchOrderSetting)

  const handleAddItem = useCallback(() => {
    store.addRow()
  }, [])

  const memorizedColumns = useMemo(() => getColumns(), [])
  return (
    <Table<DetailListItem>
      isDiy
      isKeyboard
      isEdit
      id='order_edit'
      onAddRow={handleAddItem}
      data={store.list.slice()}
      columns={memorizedColumns}
      trHighlightClass={trHighlightClass}
      isTrHighlight={isTrHighlight}
    />
  )
}

export default observer(EditList)
