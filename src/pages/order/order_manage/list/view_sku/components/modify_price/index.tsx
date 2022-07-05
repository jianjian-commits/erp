import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import { Price, Flex, Popover, Button, RightSideModal, Tip } from '@gm-pc/react'
import classNames from 'classnames'
import { Table } from '@gm-pc/table-x'
import { Order, Order_State } from 'gm_api/src/order'
import {
  BatchUpdateOrderPrice,
  BatchUpdateOrderPriceRequest_UpdateData,
} from 'gm_api/src/orderlogic'
import store from './store'
import type { Data } from './store'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import globalStore from '@/stores/global'
import Warning from '@/img/warning.png'
import { getFeeUnitName, getOrderUnitName } from '@/pages/order/util'
import { Quotation_Type } from 'gm_api/src/merchandise/types'
import LineText from '@/pages/order/components/line_text'
import { Select as ASelect, Popover as APopover, Dropdown, Menu } from 'antd'
import CurrentSellPriceTable from '@/pages/order/order_manage/list/components/popover/current_sell_price_table'
import SvgPriceReference from '@/svg/price-reference.svg'
import triangle_down from '@/img/triangle_down.png'
import { convertUnit } from '@/common/util'
import Big from 'big.js'
import { openHistoryPriceModal } from '@/pages/merchandise/components/history_price_modal'
import {
  Sku_SupplierCooperateModelType,
  Unit,
  UnitType,
} from 'gm_api/src/merchandise'
import OrderReferencePriceMap from '@/pages/order/order_manage/components/order_reference_price_map'
import Filter from '@/svg/filter.svg'

interface ModifyPriceProps {
  selected: string[]
  isSelectedAll: boolean
  destory: () => void
}
const ModifyPrice: FC<ModifyPriceProps> = ({
  selected,
  isSelectedAll,
  destory,
}) => {
  function handleCancel() {
    RightSideModal.hide()
  }

  async function handleSave() {
    const { list } = store
    let params: BatchUpdateOrderPriceRequest_UpdateData[] = []
    try {
      params = list.map((v) => {
        if (_.isNil(v.price)) {
          throw new Error(t('单价不能为空'))
        }
        if (v.price >= Math.pow(10, 8)) {
          throw new Error(t(`${v?.name}单价不能超过1亿`))
        }
        return {
          ssu_id: {
            sku_id: v.sku_id!,
            unit_id: v.unit_id!,
          },
          price: {
            unit_id: v.fee_unit_id,
            price: `${v.price}`,
          },
          order_ids: (v.orders || []).map((_v) => _v.order_id),
        }
      })
    } catch (error) {
      Tip.danger((error as Error).message)
      return Promise.reject(error)
    }
    return BatchUpdateOrderPrice({
      update: params,
    }).then(() => {
      destory()
      globalStore.showTaskPanel('1')
      return null
    })
  }

  useEffect(() => {
    store.fetchList(selected, isSelectedAll)
  }, [selected, isSelectedAll])

  const renderModalHeader = () => {
    return (
      <Flex row className='gm-margin-bottom-10'>
        <Flex flex justifyEnd alignEnd className='gm-padding-bottom-5'>
          <Button className='gm-margin-right-10' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSave}>
            {t('确定')}
          </Button>
        </Flex>
      </Flex>
    )
  }

  function handlePriceChange(index: number, value: number | null) {
    store.updateRowItem(index, 'price', value)
  }

  return (
    <div className='gm-padding-15'>
      {renderModalHeader()}
      <Table<Data>
        data={store.list.slice()}
        tiled
        columns={[
          {
            Header: t('商品编码'),
            minWidth: 120,
            accessor: 'customize_code',
          },
          {
            Header: t('商品名'),
            width: 120,
            accessor: 'name',
          },
          {
            Header: t('报价单/菜谱'),
            minWidth: 120,
            id: 'salemenu_name',
            accessor: (d: any) => {
              const quotationIds =
                store.customer_quotation_relation[
                  d.orders[0]?.receive_customer_id
                ]?.values || []
              const quotation = _.find(store.quotations, (item) => {
                const isValid = quotationIds.includes(item.quotation_id)
                const isValidType = [
                  Quotation_Type.WITHOUT_TIME,
                  Quotation_Type.PERIODIC,
                ].includes(item.type)
                return isValid && isValidType
              })
              const childQuotationParentId =
                store.parent_child_quotation_id_map || {}
              // 周期报价单子报价单
              const childQuotation = _.get(
                store.quotations,
                _.get(childQuotationParentId, quotation?.quotation_id || ''),
              )
              return (
                _.filter(
                  [quotation?.inner_name, childQuotation?.inner_name],
                  (v) => !_.isEmpty(v),
                ).join('-') || '-'
              )
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
            Header: t('下单单位'),
            accessor: 'unit',
            width: 130,
            Cell: (cellProps) => {
              const { parentUnit, unit } = cellProps.original
              return getOrderUnitName(parentUnit, unit)
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
            Cell: ({ original }) => {
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
                      unitVal =
                        unitVal && convertUnit(unitVal, original.unit_id!)
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
                          zIndex={1043}
                          content={
                            <CurrentSellPriceTable
                              sale_reference_prices={target || []}
                              skuUnit={original.unit}
                              onClick={() => {
                                if (!original.unit_id || !original.sku_id)
                                  return
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
                            className='tw-text-blue-500 tw-ml-1 tw-cursor-pointer hover:tw-bg-blue-50'
                            onClick={() => {
                              // if (!original.unit_id || !original.sku_id) return
                              // openHistoryPriceModal({
                              //   title: original.name + '-历史销售价',
                              //   sku_unit_filter: {
                              //     order_unit_id: original.unit_id!,
                              //     sku_id: original.sku_id!,
                              //     unit_id: original.unit_id!,
                              //     receive_customer_id:
                              //       original.orders?.[0]?.receive_customer_id,
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
            Header: t('商品单价'),
            accessor: 'price',
            width: 130,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const { original, index } = cellProps

                  return (
                    <Flex alignCenter>
                      <PrecisionInputNumber
                        precisionType='order'
                        value={original.price}
                        onChange={(value) => handlePriceChange(index, value)}
                        className={classNames({
                          'b-bg-warning':
                            _.isNil(original.price) ||
                            original.price >= Math.pow(10, 8),
                        })}
                      />
                      {Price.getUnit()}
                    </Flex>
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('订单'),
            accessor: 'orders',
            minWidth: 120,
            Cell: (cellProps) => {
              const orders = (cellProps.original.orders || []).slice()
              const { sku_id, unit_id } = cellProps.original
              return (
                <Popover
                  type='hover'
                  right
                  popup={
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <Table<Order>
                        data={orders}
                        columns={[
                          {
                            Header: t('订单号'),
                            accessor: 'serial_no',
                            minWidth: 150,
                            Cell: (cell) => {
                              const order = cell.original
                              if (order.state === Order_State.STATE_RECEIVABLE)
                                return (
                                  <div>
                                    <span
                                      className='gm-margin-right-5'
                                      style={{ lineHeight: '20px' }}
                                    >
                                      {order.serial_no}
                                    </span>
                                    <Popover
                                      type='hover'
                                      popup={t('已签收的订单价格不会变动')}
                                    >
                                      <img src={Warning} />
                                    </Popover>
                                  </div>
                                )
                              return order.serial_no
                            },
                          },
                          {
                            Header: t('商户名'),
                            id: 'resname',
                            minWidth: 150,
                            accessor: (d) =>
                              store.customers[d.receive_customer_id!].name ||
                              '-',
                          },
                          {
                            Header: t('当前单价'),
                            id: 'std_sale_price_forsale',
                            minWidth: 150,
                            Cell: (cell) => {
                              const detail =
                                cell.original.order_details?.order_details?.find(
                                  (detail) =>
                                    detail.sku_id === sku_id &&
                                    detail.unit_id === unit_id,
                                )
                              const price =
                                detail?.order_unit_value_v2?.price?.val || '-'
                              return (
                                price +
                                Price.getUnit() +
                                '/' +
                                getFeeUnitName(detail! as any)
                              )
                            },
                          },
                        ]}
                      />
                    </div>
                  }
                >
                  <Flex>
                    <a style={{ textDecoration: 'underline' }}>
                      {t('共')}
                      {_.uniqBy(orders, 'order_id').length}
                      {t('个订单')}
                    </a>
                  </Flex>
                </Popover>
              )
            },
          },
        ]}
      />
    </div>
  )
}

export default observer(ModifyPrice)
