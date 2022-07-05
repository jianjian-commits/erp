import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { Flex, RightSideModal, Select } from '@gm-pc/react'
import { Observer, observer } from 'mobx-react'

import store from './store'
import { DetailListItem } from '../interface'
import Operation from './components/cell_operation'
import CellSku from './components/cell_sku_selector'
import CellQuantity from './components/cell_quanlity'
import CellPrice from './components/cell_price'
import CellRemark from './components/cell_remark'
import RecommendRow from './components/recommend_row'
import { getFeePriceByUnit } from '@/pages/order/order_manage/components/detail/util'
import globalStore from '@/stores/global'
import { toFixedOrder } from '@/common/util'
import { isCombineSku, transformOutStock } from '@/pages/order/util'
import _ from 'lodash'
import { Permission } from 'gm_api/src/enterprise'
import CellInputNumber from '@/pages/order/order_manage/components/cell_input_number'
import { isSsuInvalid } from './util'
import CellSkuException from '@/pages/order/order_manage/components/batch/components/cell_sku_exception'

type SsuListProps = { index: number }
const { OperationHeader, TABLE_X } = TableXUtil

const SsuList: FC<SsuListProps> = observer(({ index }) => {
  const { list } = store
  const order = list[index]
  if (!order) {
    RightSideModal.hide()
    return null
  }

  function handleAddItem() {
    store.addSsuRow(index)
  }

  return (
    <div style={{ overflowY: 'auto', minHeight: '100vh' }}>
      <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
        <strong
          className='gm-padding-left-5 gm-text-14'
          style={{ borderLeft: '3px solid var(--gm-color-primary)' }}
        >
          {t('编辑订单')}
          <span>{t('（免运费）')}</span>
        </strong>
        <div className='gm-padding-top-15'>
          <span className='gm-margin-right-15'>
            {t('商户：')}
            {`${order.info.customer?.name || '-'}/${
              order.info.customer?.customized_code || '-'
            }`}
          </span>
          <span className='gm-margin-right-15'>
            {t('运营时间')}：{order.info?.service_period?.name || '-'}
          </span>
        </div>
      </div>
      <Flex column className='gm-padding-tb-10'>
        <Table<DetailListItem>
          isKeyboard
          isEdit
          tiled
          id='order_batch'
          onAddRow={handleAddItem}
          data={(order.list || []).slice()}
          SubComponent={(row) => {
            return <RecommendRow row={row} order={order} orderIndex={index} />
          }}
          columns={[
            {
              Header: OperationHeader,
              id: 'operation',
              fixed: 'left',
              width: TABLE_X.WIDTH_OPERATION,
              Cell: (cellProps) => {
                const { index: ssuIndex, original } = cellProps
                return original.parentId ? null : (
                  <Operation
                    orderIndex={index}
                    ssuIndex={ssuIndex}
                    ingredientsCount={_.size(original.ingredientsInfo)}
                  />
                )
              },
            },
            {
              Header: t('商品编码'),
              minWidth: 80,
              accessor: 'customize_code',
              Cell(cellProps) {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return cellProps.value
              },
            },
            {
              Header: t('商品名'),
              minWidth: 145,
              accessor: 'name',
              isKeyboard: true,
              Cell: (cellProps) => {
                const { original } = cellProps
                if (isSsuInvalid(original)) {
                  return <CellSkuException skuName={original.name} />
                }
                return (
                  <CellSku
                    orderIndex={index}
                    index={cellProps.index}
                    sku={original}
                  />
                )
              },
            },
            {
              Header: t('下单单位'),
              minWidth: 140,
              accessor: 'unit_id',
              isKeyboard: true,
              Cell: (cellProps) => {
                const {
                  units,
                  unit_id,
                  prices,
                  isUsingSecondUnitOutStock,
                  second_base_unit_id,
                  base_unit_id,
                  unit: unitInfo,
                  parentId,
                  tax,
                } = cellProps.original
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return (
                  <Select
                    value={unit_id}
                    data={
                      !units
                        ? [{ value: unit_id, text: unitInfo?.name || '' }]
                        : units
                    }
                    disabled={!!parentId}
                    placeholder={t('请选择下单单位')}
                    onChange={(val) => {
                      if (val === unit_id) return
                      let updates = {}
                      const unit = units?.find(
                        (item) => item.unit_id === val || item.value === val,
                      )
                      const sameGroupWithSecondUnit =
                        globalStore.isSameUnitGroup(val, second_base_unit_id!)
                      // 最小下单数
                      const minimum_order_number = prices?.find(
                        (item) => item.order_unit_id === val,
                      )?.minimum_order_number
                      // 初始化出库单位
                      if (isUsingSecondUnitOutStock) {
                        if (sameGroupWithSecondUnit) {
                          updates = {
                            std_unit_id: base_unit_id,
                            std_unit_id_second: val,
                            std_quantity: minimum_order_number
                              ? toFixedOrder(
                                  transformOutStock(
                                    +minimum_order_number,
                                    val,
                                    cellProps.original,
                                    'FROM_SECONDUNIT',
                                  ),
                                )
                              : '',
                            std_quantity_second: minimum_order_number,
                          }
                        } else {
                          updates = {
                            std_unit_id: val,
                            std_unit_id_second: second_base_unit_id,
                            std_quantity: minimum_order_number || '',
                            std_quantity_second: minimum_order_number
                              ? toFixedOrder(
                                  transformOutStock(
                                    +minimum_order_number,
                                    val,
                                    cellProps.original,
                                    'TO_SECONDUNIT',
                                  ),
                                )
                              : '',
                          }
                        }
                      } else {
                        updates = {
                          std_unit_id: val,
                          std_quantity: minimum_order_number || '',
                        }
                      }
                      const { price, fee_unit_id, no_tax_price } =
                        getFeePriceByUnit(val, prices!, units!, tax!)
                      Object.assign(updates, {
                        unit_id: val,
                        unit,
                        price,
                        no_tax_price,
                        fee_unit_id,
                        quantity: minimum_order_number || '0.01',
                      })
                      store.resetAddOrderValue(index, cellProps.index)
                      store.updateSsuRow(index, cellProps.index, {
                        ..._.omit(cellProps.original, [
                          'std_unit_id',
                          'std_unit_id_second',
                        ]),
                        ...updates,
                      })
                    }}
                  />
                )
              },
            },
            {
              Header: t('分类'),
              accessor: 'category_name',
              minWidth: 110,
              Cell(cellProps) {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return cellProps.value
              },
            },
            {
              Header: t('报价单简称（对外）'),
              minWidth: 110,
              accessor: 'quotationName',
            },
            {
              Header: t('下单数'),
              accessor: 'quantity',
              minWidth: 110,
              isKeyboard: true,
              Cell: (cellProps) => {
                const { original } = cellProps
                if (isSsuInvalid(original)) {
                  return '-'
                }
                return (
                  <CellQuantity
                    orderIndex={index}
                    ssuIndex={cellProps.index}
                    original={original}
                  />
                )
              },
            },
            {
              Header: t('单价'),
              accessor: 'price',
              minWidth: 110,
              isKeyboard: true,
              Cell: (cellProps) => {
                const { original } = cellProps
                if (isSsuInvalid(original)) {
                  return '-'
                }
                return (
                  <CellPrice
                    orderIndex={index}
                    ssuIndex={cellProps.index}
                    original={original}
                  />
                )
              },
            },
            {
              Header: t('加单数1'),
              accessor: 'add_order_value1',
              width: 190,
              hide:
                globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
                ),
              Cell: (cellProps) => {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return (
                  <Observer>
                    {() => {
                      const { add_order_value1, unit, parentId } =
                        cellProps.original
                      const disabled =
                        isCombineSku(cellProps.original) || !!parentId
                      return (
                        <CellInputNumber
                          disabled={disabled}
                          value={add_order_value1?.quantity?.val}
                          onChange={(val) => {
                            store.updateAddOrderValue(
                              index,
                              cellProps.index,
                              'add_order_value1',
                              val,
                            )
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
              Header: t('加单数2'),
              accessor: 'add_order_value2',
              width: 190,
              hide:
                globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
                ),
              Cell: (cellProps) => {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return (
                  <Observer>
                    {() => {
                      const { add_order_value2, unit, parentId } =
                        cellProps.original
                      const disabled =
                        isCombineSku(cellProps.original) || !!parentId
                      return (
                        <CellInputNumber
                          disabled={disabled}
                          value={add_order_value2?.quantity?.val}
                          onChange={(val) => {
                            store.updateAddOrderValue(
                              index,
                              cellProps.index,
                              'add_order_value2',
                              val,
                            )
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
              Header: t('加单数3'),
              accessor: 'add_order_value3',
              width: 190,
              hide:
                globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
                ),
              Cell: (cellProps) => {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return (
                  <Observer>
                    {() => {
                      const { add_order_value3, unit, parentId } =
                        cellProps.original
                      const disabled =
                        isCombineSku(cellProps.original) || !!parentId
                      return (
                        <CellInputNumber
                          disabled={disabled}
                          value={add_order_value3?.quantity?.val}
                          onChange={(val) => {
                            store.updateAddOrderValue(
                              index,
                              cellProps.index,
                              'add_order_value3',
                              val,
                            )
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
              Header: t('加单数4'),
              accessor: 'add_order_value4',
              width: 190,
              hide:
                globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
                ),
              Cell: (cellProps) => {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                return (
                  <Observer>
                    {() => {
                      const { add_order_value4, unit, parentId } =
                        cellProps.original
                      const disabled =
                        isCombineSku(cellProps.original) || !!parentId
                      return (
                        <CellInputNumber
                          disabled={disabled}
                          value={add_order_value4?.quantity?.val}
                          onChange={(val) => {
                            store.updateAddOrderValue(
                              index,
                              cellProps.index,
                              'add_order_value4',
                              val,
                            )
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
              Header: t('备注'),
              minWidth: 90,
              accessor: 'remark',
              isKeyboard: true,
              Cell: (cellProps) => {
                if (isSsuInvalid(cellProps.original)) {
                  return '-'
                }
                const { original } = cellProps
                return (
                  <CellRemark
                    orderIndex={index}
                    ssuIndex={cellProps.index}
                    original={original}
                  />
                )
              },
            },
          ]}
        />
      </Flex>
    </div>
  )
})

SsuList.displayName = 'SsuList'

export default SsuList
