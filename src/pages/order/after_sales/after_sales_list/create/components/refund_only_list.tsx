import React, { FC, useCallback, ChangeEvent, useEffect } from 'react'
import { Flex, MoreSelectDataItem, Price, Select } from '@gm-pc/react'
import { KCInputNumber, KCMoreSelect } from '@gm-pc/keyboard'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store, { initRefundOnlyList } from '../../store/detail_store'
import { observer, Observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import {
  InputTextCell,
  TextAreaCell,
  TableSelectCell,
} from '../../components/after_sales_cell'
import { toFixedOrder } from '@/common/util'
import { toBasicUnit } from '@/pages/order/util'
import {
  AfterSaleType,
  AFTER_SALES_REASON,
  AFTER_SALES_WAY,
  LiteAfterSaleType,
} from '../../enum'
import type { RefundOnlyList as RefundOnlyList_ } from '../../interface'
import {
  AfterSaleOrderDetail_Type,
  AfterSaleOrder_Status,
} from 'gm_api/src/aftersale'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { Button, message, Row, Space } from 'antd'
import {
  ListBasicPriceByCustomerID,
  Quotation_Type,
  UnitValueSet,
} from 'gm_api/src/merchandise'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'

const { OperationHeader, TABLE_X, EditOperation } = TableXUtil

const RefundOnlyList: FC<{ customer_id?: string; order_id?: string }> =
  observer((props) => {
    const { refundDetailOnly } = store

    useEffect(() => {
      // 拉下供应商列表
      store.fetchMerchantList()
    }, [])

    const delDisable = refundDetailOnly.length === 1
    const handleDetailAdd = useCallback(() => {
      store.addTableItem()
    }, [])

    const handleDeleteItem = (index: number) => {
      store.deleteTableItem(index)
    }

    /** 整单售后 */
    const afterSaleTotalOrder = () => {
      /** 已选择的商品 */
      const seletedIdList: string[] = []
      /** 新增商品可填充位置 */
      const addIndexList: number[] = []

      _.forEach(store.refundDetailOnly, (selectedItem, index) => {
        const { sku_id } = selectedItem
        if (sku_id) {
          seletedIdList.push(sku_id)
        } else {
          addIndexList.push(index)
        }
      })

      for (
        let i = 0;
        i < store.sku_list.length - store.refundDetailOnly.length;
        i++
      ) {
        addIndexList.push(store.refundDetailOnly.length + i)
      }

      _.forEach(store.sku_list, (skuItem) => {
        if (!seletedIdList.includes(skuItem.sku_id)) {
          const apply_return_value = {
            input: {
              unit_id: '',
              quantity: store.return_value_map[skuItem.value],
              price: '',
            },
            calculate: {
              unit_id: '',
              quantity: store.return_value_map[skuItem.value],
              price: '',
            },
          }

          store.updateRefundDetailOnlyLine(addIndexList[0], initRefundOnlyList)
          selectSku({ index: addIndexList[0] }, skuItem, apply_return_value)
          addIndexList.shift()
        }
      })
    }

    /** 选择商品 */
    const selectSku = (
      cellProps: any,
      selected: any,
      defaultReturnValue?: any,
    ) => {
      const { sku_id, value } = selected
      // 售后类型相关处理
      const id =
        store.headerDetail.order_id && store.headerDetail.order_id !== '0'
          ? value
          : sku_id
      let type = globalStore.isLite
        ? AfterSaleOrderDetail_Type.TYPE_REFUND
        : AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN

      if (globalStore.isLite) {
        // 轻巧版仅支持“仅退款”售后
        if (store.selectedSkuCount[id]) {
          return message.error(t('同一商品最多只能有两条不同类型的售后记录'))
        } else {
          store.setSelectedSkuCount(id, {
            returnRefund: false,
            refund: true,
          })
          type = AfterSaleOrderDetail_Type.TYPE_REFUND
        }
      } else {
        // 标准版
        if (store.selectedSkuCount[id]) {
          const item = _.cloneDeep(store.selectedSkuCount[id])
          if (!store.selectedSkuCount[id]?.returnRefund) {
            item.returnRefund = true
            store.setSelectedSkuCount(id, item)
          } else if (!store.selectedSkuCount[id].refund) {
            item.refund = true
            store.setSelectedSkuCount(id, item)
            type = AfterSaleOrderDetail_Type.TYPE_REFUND
          } else {
            return message.error(t('同一商品最多只能有两条不同类型的售后记录'))
          }
        } else {
          store.setSelectedSkuCount(id, {
            returnRefund: true,
            refund: false,
          })
        }
      }

      // 添加售后条目信息
      const { index } = cellProps
      if (store.headerDetail.order_id) {
        const apply_return_value = {
          input: {
            unit_id: '',
            quantity: '',
            price: '',
          },
          calculate: {
            unit_id: '',
            quantity: '',
            price: '',
          },
        }
        return selectOrderSku(
          index,
          defaultReturnValue || apply_return_value,
          type,
          selected,
        )
      } else {
        return selectedQuotationMerchandise(
          index,
          cellProps.original,
          selected,
          type,
        )
      }
    }

    /** 关联订单，选择订单商品 */
    const selectOrderSku = (
      index: number,
      apply_return_value: UnitValueSet,
      type: AfterSaleOrderDetail_Type,
      selected?: any,
    ) => {
      if (selected) {
        const {
          ssu_data,
          unit_cal_info,
          base_unit_id,
          second_base_unit_id,
          second_base_unit_ratio,
        } = selected
        const show_category_text = selected.category_name
        const show_ssu = `${ssu_data?.ssu_unit_rate!}${ssu_data?.ssu_unit_parent_name!}/${
          ssu_data?.ssu_unit_name
        }`

        const {
          fee_unit_id,
          unit_id,
          fee_unit_name,
          outstock_unit_name,
          ssu_unit_parent_name,
          ssu_unit_name,
        } = ssu_data

        store.updateRefundDetailOnlyBatch(index, [
          {
            key: 'fee_unit_id',
            value: fee_unit_id,
          },
          {
            key: 'unit_id',
            value: unit_id,
          },
          {
            key: 'unit_cal_info',
            value: unit_cal_info,
          },
          {
            key: 'base_unit_id',
            value: base_unit_id,
          },
          {
            key: 'second_base_unit_id',
            value: second_base_unit_id,
          },
          {
            key: 'second_base_unit_ratio',
            value: second_base_unit_ratio,
          },
        ])

        store.updateRefundDetailOnly(index, 'fee_unit_name', fee_unit_name)
        store.updateRefundDetailOnly(
          index,
          'outstock_unit_name',
          outstock_unit_name || '-',
        )
        store.updateRefundDetailOnly(index, 'sku_name', selected)
        store.updateRefundDetailOnly(
          index,
          'ssu_base_unit_name',
          ssu_unit_parent_name,
        )
        store.updateRefundDetailOnly(index, 'ssu_unit_name', ssu_unit_name)

        const _apply_return_value = Object.assign({}, apply_return_value)
        _.set(_apply_return_value, 'input.unit_id', unit_id)
        _.set(_apply_return_value, 'input.price', selected?.sales_price!)
        _.set(_apply_return_value, 'calculate.price', selected?.sales_price!)
        _.set(_apply_return_value, 'calculate.unit_id', fee_unit_id)
        store.updateRefundDetailOnly(
          index,
          'apply_return_value',
          _apply_return_value,
        )

        store.updateRefundDetailOnly(
          index,
          'can_return_value',
          store.return_value_map[selected?.value!],
        )
        store.updateRefundDetailOnly(index, 'sku_id', selected?.sku_id!)
        store.updateRefundDetailOnly(index, 'order_detail_id', selected?.value!)
        store.updateRefundDetailOnly(index, 'sale_ratio', show_ssu)
        store.updateRefundDetailOnly(index, 'category_name', show_category_text)
        store.updateRefundDetailOnly(
          index,
          'sales_price',
          selected?.sales_price!,
        )
        store.updateRefundDetailOnly(index, 'amount', selected?.amount!)
        store.updateRefundDetailOnly(
          index,
          'supplier_id',
          selected?.supplier_id!,
        )
        store.updateRefundDetailOnly(index, 'type', type)
        store.updateRefundDetailOnly(index, 'flag', 1)
      } else {
        store.updateRefundDetailOnly(index, 'sku_name', selected)
        store.updateRefundDetailOnly(index, 'flag', 0)
      }
    }

    /** 不关联订单搜索报价单中商品 */
    const handleSearchSku = (value: string) => {
      if (!store.headerDetail.order_id) {
        ListBasicPriceByCustomerID({
          filter_params: {
            q: value,
            customer_id: props.customer_id,
            quotation_types: [
              Quotation_Type.WITHOUT_TIME,
              Quotation_Type.PERIODIC,
            ],
          },
          paging: { offset: 0, limit: 99 },
        }).then((json) => {
          const { basic_prices, sku_map = {}, category_map } = json.response
          const newList = _.map(basic_prices, (basicPriceItem) => {
            const {
              sku_id,
              items: { basic_price_items = [] },
            } = basicPriceItem

            const sku = sku_map[sku_id!]

            let unit_id, fee_unit_id, price
            const units = basic_price_items!.map((item) => {
              const target = sku?.units?.units?.find(
                (item2) => item2.unit_id === item.order_unit_id,
              )

              const parentUnitName = globalStore.unitList.find(
                (unit) =>
                  unit.value === (target?.parent_id || item.order_unit_id),
              )?.text

              const name = target
                ? `${target.name}(${target.rate}${parentUnitName})`
                : parentUnitName
              return {
                ...target,
                value: item.order_unit_id,
                text: name,
                name,
                sales_price: item.fee_unit_price?.val || 0,
              }
            })
            const { texts } = getCategoryValue(
              [],
              [sku.category_id || ''],
              category_map,
            )

            return {
              ...sku,
              text: sku.name,
              value: sku_id,
              units,
              unit_id,
              fee_unit_id,
              price,
              order_detail_id: '0',
              order: '0',
              category_name:
                texts.length > 1
                  ? texts.join('/')
                  : texts.length
                  ? texts[0]
                  : '',
            }
          })
          store.updateSkuList(newList)
        })
      }
    }

    /** 不关联订单，选择商品 */
    const selectedQuotationMerchandise = (
      index: number,
      original: any,
      selected: any,
      type: AfterSaleOrderDetail_Type,
    ) => {
      const { units, unit_id, name } = selected

      const skuSelected = {
        sku_name: name,
        show_category_text: '',
        units,
        unit_id,
      }
      store.updateRefundDetailOnlyLine(index, {
        ...original,
        ...selected,
        ...skuSelected,
        type,
        receive_customer_id: store.headerDetail.customers.customer_id,
        sku_name: selected,
        flag: 1,
      })
    }

    /** 选择售后类型呢 */
    const changeAfterSaleType = (
      value: AfterSaleOrderDetail_Type,
      cellProps: any,
    ) => {
      const {
        index,
        original: { sku_id, type },
      } = cellProps
      const id =
        store.headerDetail.order_id && store.headerDetail.order_id !== '0'
          ? cellProps.original.value
          : sku_id
      if (!id) {
        return store.updateRefundDetailOnly(index, 'type', value)
      }
      if (value !== type) {
        const item = store.selectedSkuCount[id]
        if (item.returnRefund && item.refund) {
          return message.error(t('同一商品在同一售后类型下只能存在一条记录'))
        }

        const newItem = {
          returnRefund: value === AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
          refund: value !== AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
        }
        store.setSelectedSkuCount(id, newItem)
        store.updateRefundDetailOnly(index, 'type', value)
      }
      store.updateRefundDetailOnly(index, 'type', value)
    }

    const column: Column<RefundOnlyList_>[] = React.useMemo(() => {
      return [
        {
          Header: t('序号'),
          accessor: 'num',
          fixed: 'left',
          width: TABLE_X.WIDTH_NO,
          Cell: (cellProps) => {
            const { index } = cellProps
            return index + 1
          },
        },

        {
          Header: OperationHeader,
          accessor: 'action',
          diyItemText: t('操作'),
          fixed: 'left',
          width: TABLE_X.WIDTH_EDIT_OPERATION,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                return (
                  <EditOperation
                    onDeleteRow={
                      delDisable
                        ? undefined
                        : () => handleDeleteItem(cellProps.index)
                    }
                    onAddRow={handleDetailAdd}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('商品名'),
          isKeyboard: true,
          accessor: 'sku_name',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  original: { sku_name },
                } = cellProps
                return (
                  <Flex justifyStart alignCenter>
                    <TableSelectCell
                      selected={sku_name}
                      onSearch={handleSearchSku}
                      onSelect={(selected) => {
                        selectSku(cellProps, selected)
                      }}
                    />
                  </Flex>
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('下单单位'),
          accessor: 'units',
          hide: !!store.headerDetail.order_id,
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const { units, unit_id, apply_return_value } =
                  cellProps.original
                return (
                  <Select
                    style={{ width: 100 }}
                    value={unit_id}
                    data={units}
                    onChange={(value) => {
                      const unitIndex = _.findIndex(
                        units,
                        (unitItem) => unitItem.value === value,
                      )
                      const { sales_price, name } = units[unitIndex]
                      const _apply_return_value = Object.assign(
                        {},
                        apply_return_value,
                      )
                      _.set(_apply_return_value, 'input.unit_id', value)
                      _.set(_apply_return_value, 'input.price', sales_price)
                      _.set(_apply_return_value, 'calculate.price', sales_price)
                      _.set(_apply_return_value, 'calculate.unit_id', value)
                      store.updateRefundDetailOnly(
                        cellProps.index,
                        'apply_return_value',
                        _apply_return_value,
                      )

                      store.updateRefundDetailOnly(
                        cellProps.index,
                        'sales_price',
                        sales_price,
                      )
                      store.updateRefundDetailOnly(
                        cellProps.index,
                        'fee_unit_name',
                        name,
                      )
                      store.updateRefundDetailOnly(
                        cellProps.index,
                        'unit_id',
                        value,
                      )
                    }}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('商品分类'),
          accessor: 'category_name',
          minWidth: 190,
          Cell: (cellProps) => {
            return (
              <TextAreaCell field='category_name' data={cellProps.original} />
            )
          },
        },

        {
          Header: t('售后类型'),
          accessor: 'type',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                return (
                  <Select
                    style={{ width: 100 }}
                    value={cellProps.original.type}
                    data={
                      globalStore.isLite ? LiteAfterSaleType : AfterSaleType
                    }
                    onChange={(value) => changeAfterSaleType(value, cellProps)}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('出库数'),
          accessor: 'amount',
          minWidth: 190,
          Cell: (cellProps) => {
            return <TextAreaCell field='amount' data={cellProps.original} />
          },
        },
        {
          Header: t('销售单价'),
          accessor: 'sales_price',
          minWidth: 190,
          Cell: (cellProps) => {
            return (
              <TextAreaCell field='sales_price' data={cellProps.original} />
            )
          },
        },
        {
          Header: t('可退数量'),
          accessor: 'can_return_value',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const { can_return_value, fee_unit_name } = cellProps.original
                return (
                  <div>
                    {can_return_value
                      ? `${can_return_value}${fee_unit_name}`
                      : '-'}
                  </div>
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('申请退款数'),
          isKeyboard: true,
          accessor: 'apply_return_value',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: {
                    apply_return_value,
                    can_return_value,
                    outstock_unit_name,
                  },
                } = cellProps
                const { quantity } = apply_return_value?.input!
                const _quantity = quantity === '' ? null : parseFloat(quantity!)
                return (
                  <Flex justifyStart alignCenter>
                    <KCInputNumber
                      placeholder={t('请填写申请退款数')}
                      value={_quantity}
                      onChange={(value: number) => {
                        const new_value = value === null ? '' : value + ''
                        const _apply_return_value = Object.assign(
                          {},
                          apply_return_value,
                        )
                        _.set(_apply_return_value, 'input.quantity', new_value)
                        _.set(
                          _apply_return_value,
                          'calculate.quantity',
                          new_value,
                        )
                        store.updateRefundDetailOnly(
                          index,
                          'apply_return_value',
                          _apply_return_value,
                        )
                      }}
                      min={0}
                      max={
                        store.headerDetail.order_id
                          ? Number(can_return_value)
                          : 999999
                      } // 退款数小于等于出库数
                      style={{ width: '120px' }}
                    />
                    <Flex className='gm-margin-left-5'>
                      {outstock_unit_name}
                    </Flex>
                  </Flex>
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('退款单价'),
          isKeyboard: true,
          accessor: 'apply_return_value',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { apply_return_value, fee_unit_name, sales_price },
                } = cellProps
                const { price } = apply_return_value?.input!
                const _price = price === '' ? null : parseFloat(price!)
                return (
                  <Flex justifyStart alignCenter>
                    <KCInputNumber
                      placeholder={t('请填写退款单价')}
                      value={_price}
                      onChange={(value: number) => {
                        const new_value = value === null ? '' : value + ''
                        const _apply_return_value = Object.assign(
                          {},
                          apply_return_value,
                        )
                        _.set(_apply_return_value, 'input.price', new_value)
                        _.set(_apply_return_value, 'calculate.price', new_value)
                        store.updateRefundDetailOnly(
                          index,
                          'apply_return_value',
                          _apply_return_value,
                        )
                      }}
                      min={0}
                      max={
                        store.headerDetail.order_id
                          ? Number(sales_price)
                          : 99999
                      }
                      style={{ width: '110px' }}
                    />
                    <Flex className='gm-margin-left-5'>{`${Price.getUnit()}/${
                      fee_unit_name || '-'
                    }`}</Flex>
                  </Flex>
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('申请退款金额'),
          accessor: 'apply_return_value',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  original: { apply_return_value },
                } = cellProps
                const { input } = apply_return_value
                let order_price = ''
                if (store.headerDetail.order_id) {
                  order_price = toFixedOrder(
                    Big(
                      toBasicUnit(
                        input?.quantity || '0',
                        cellProps.original,
                        'quantity',
                      ),
                    ).times(
                      toBasicUnit(
                        input?.price || '0',
                        cellProps.original,
                        'price',
                      ),
                    ),
                  )
                } else {
                  order_price = toFixedOrder(
                    Big(input?.quantity || '0').times(input?.price || '0'),
                  )
                }
                store.updateRefundDetailOnly(
                  cellProps.index,
                  'apply_return_amount',
                  order_price,
                )

                return <div>{order_price + Price.getUnit()}</div>
              }}
            </Observer>
          ),
        },
        {
          Header: t('处理方式'),
          accessor: 'task_method',
          minWidth: 190,
          Cell: (cellProps) => {
            return (
              <TextAreaCell field='task_method' data={cellProps.original} />
            )
          },
        },
        {
          Header: t('实退数'),
          accessor: 'real_return_value',
          minWidth: 190,
          Cell: (cellProps) => {
            const {
              original: { real_return_value, outstock_unit_name, status },
            } = cellProps
            return (
              <Flex justifyStart alignCenter>
                {(status &&
                  status === AfterSaleOrder_Status.STATUS_REFUNDED &&
                  Object.keys(real_return_value).length > 0 && (
                    <>
                      <Flex className='gm-margin-left-5'>
                        {Number(
                          real_return_value?.calculate?.quantity! || 0,
                        ).toFixed(2)}
                      </Flex>
                      <Flex className='gm-margin-left-5'>
                        {outstock_unit_name}
                      </Flex>
                    </>
                  )) ||
                  '-'}
              </Flex>
            )
          },
        },
        {
          Header: t('实退金额'),
          accessor: 'real_return_amount',
          minWidth: 190,
          Cell: (cellProps) => {
            const {
              original: { status },
            } = cellProps
            return (
              <>
                {(status &&
                  status === AfterSaleOrder_Status.STATUS_COMPLETED && (
                    <TextAreaCell
                      field='real_return_amount'
                      data={cellProps.original}
                    />
                  )) ||
                  '-'}
              </>
            )
          },
        },
        {
          Header: t('供应商'),
          accessor: 'supplier_id',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { supplier_id },
                } = cellProps
                const { supplierList } = store
                return (
                  <Flex justifyStart alignCenter>
                    <KCMoreSelect
                      style={{ width: '120px' }}
                      data={supplierList}
                      selected={_.find(
                        supplierList,
                        (item) => item.value === supplier_id,
                      )}
                      onSelect={(selected: MoreSelectDataItem<any>) => {
                        store.updateRefundDetailOnly(
                          index,
                          'supplier_id',
                          selected ? selected?.value! : '',
                        )
                      }}
                      placeholder={t('请选择供应商')}
                    />
                  </Flex>
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('责任部门'),
          isKeyboard: true,
          accessor: 'department_blame_name',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { department_blame_name },
                } = cellProps
                return (
                  <InputTextCell
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      store.updateRefundDetailOnly(
                        index,
                        'department_blame_name',
                        e.target.value,
                      )
                    }}
                    name='department_blame_name'
                    value={department_blame_name}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('跟进部门'),
          isKeyboard: true,
          accessor: 'department_to_name',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { department_to_name },
                } = cellProps
                return (
                  <InputTextCell
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      store.updateRefundDetailOnly(
                        index,
                        'department_to_name',
                        e.target.value,
                      )
                    }}
                    name='department_to_name'
                    value={department_to_name}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('售后原因'),
          isKeyboard: true,
          accessor: 'reason',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { reason },
                } = cellProps
                return (
                  <KCMoreSelect
                    data={AFTER_SALES_REASON}
                    selected={_.find(
                      AFTER_SALES_REASON,
                      (item) => item.value === reason,
                    )}
                    onSelect={(selected: MoreSelectDataItem<any>) => {
                      store.updateRefundDetailOnly(
                        index,
                        'reason',
                        selected?.value!,
                      )
                    }}
                    placeholder={t('请选择售后原因')}
                    style={{ width: '150px' }}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('售后方式'),
          isKeyboard: true,
          accessor: 'method',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { method },
                } = cellProps
                return (
                  <KCMoreSelect
                    data={AFTER_SALES_WAY}
                    selected={_.find(
                      AFTER_SALES_WAY,
                      (item) => item.value === method,
                    )}
                    onSelect={(selected: MoreSelectDataItem<any>) => {
                      store.updateRefundDetailOnly(
                        index,
                        'method',
                        selected?.value!,
                      )
                    }}
                    placeholder={t('请选择售后方式')}
                    style={{ width: '150px' }}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('备注'),
          isKeyboard: true,
          accessor: 'remark',
          minWidth: 190,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const {
                  index,
                  original: { remark },
                } = cellProps
                return (
                  <InputTextCell
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      store.updateRefundDetailOnly(
                        index,
                        'remark',
                        e.target.value,
                      )
                    }}
                    name='remark'
                    value={remark}
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          Header: t('最后操作人'),
          accessor: 'last_operator_id',
          minWidth: 190,
          Cell: (cellProps) => {
            return (
              <TextAreaCell
                field='last_operator_id'
                data={cellProps.original}
              />
            )
          },
        },
      ]
    }, [handleDetailAdd, delDisable])

    return (
      <>
        <Row className='after_sale_list_title' justify='space-between'>
          <Space>
            <div>{t('售后明细')}</div>
            {store.headerDetail.order_id && (
              <Button type='link' onClick={afterSaleTotalOrder}>
                {t('整单售后')}
              </Button>
            )}
          </Space>
          <TableRight />
        </Row>
        <Table
          isKeyboard
          isEdit
          isVirtualized
          onAddRow={handleDetailAdd}
          id='refund_detail_only_table'
          data={refundDetailOnly.slice()}
          columns={column}
        />
      </>
    )
  })

export default RefundOnlyList
