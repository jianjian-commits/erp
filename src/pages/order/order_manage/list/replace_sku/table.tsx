import React from 'react'
import { Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Table } from '@gm-pc/table-x'
import _ from 'lodash'
import store, { ResponseSku } from './store'
import OrderBelongPop from './components/order_belong'
import { toFixedOrder } from '@/common/util'
import CellSsu from './components/cell_ssu'
import { Select } from '@gm-pc/react'

const ReplaceSkuTable = (props: { type: string }) => {
  const { list, updateSkuList } = store
  const { type } = props

  const onUnitChange = (value: string, index: number) => {
    const newList = _.cloneDeep(list)
    newList[index].replaceUnitId = value
    updateSkuList(newList)
  }
  return (
    <Table<ResponseSku>
      data={list}
      columns={[
        {
          Header: t('替换前商品'),
          id: 'ssu',
          minWidth: 150,
          accessor: (d) => d?.name,
        },
        {
          Header: t('总下单数'),
          id: 'order.unit',
          accessor: (d) => {
            return toFixedOrder(
              _.reduce(
                d?.orders || [],
                (sum, v) => {
                  const detail = (v.order_details?.order_details || [])[0]
                  return (
                    sum + +(detail?.order_unit_value_v2?.quantity?.val || 0)
                  )
                },
                0,
              ),
            )
          },
          minWidth: 180,
        },
        {
          Header: t('所属订单'),
          id: 'belong order',
          minWidth: 150,
          accessor: (d) => {
            return <OrderBelongPop orders={d.orders || []} />
          },
        },
        {
          Header: t('替换后商品'),
          id: 'order.serial_no',
          minWidth: 200,
          Cell: (props) => {
            const { index, original } = props
            return <CellSsu index={index} original={original} type={type} />
          },
        },
        {
          Header: t('替换后下单单位'),
          id: 'unit_id',
          minWidth: 200,
          hide: type === 'combine',
          isKeyboard: true,
          Cell: (cellProps) => (
            <Observer>
              {() => {
                const { replaceUnitList, replaceUnitId } = cellProps.original
                return (
                  <Select
                    value={replaceUnitId}
                    data={replaceUnitList || []}
                    placeholder={t('请选择下单单位')}
                    onChange={(value: string) =>
                      onUnitChange(value, cellProps.index)
                    }
                  />
                )
              }}
            </Observer>
          ),
        },
      ]}
    />
  )
}

export default ReplaceSkuTable
