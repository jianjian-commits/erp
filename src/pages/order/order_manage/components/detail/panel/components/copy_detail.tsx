import { OrderDetail } from 'gm_api/src/order'
import { observer } from 'mobx-react'
import React, { FC, useMemo } from 'react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  getFeeUnitName,
  getOrderUnitName,
  isCombineSku,
} from '@/pages/order/util'
import { wrapDetailList } from '@/pages/order/order_manage/components/detail/util'
import { Price } from '@gm-pc/react'

type CopyDetailProps = Record<
  'name' | 'count' | 'unit_name' | 'fee_unit_name' | 'price' | 'isCombine',
  string
>

const CopyDetail: FC<{ dataSource: OrderDetail[] }> = observer(
  ({ dataSource }) => {
    const data = useMemo(
      () =>
        wrapDetailList(dataSource).map((item) => {
          const { quantity, price, unit, parentUnit, name } = item
          return {
            name,
            count: quantity,
            price: price,
            fee_unit_name: getFeeUnitName(item),
            unit_name: getOrderUnitName(parentUnit, unit),
            isCombine: isCombineSku(item),
          }
        }),
      [dataSource],
    )

    return (
      <Table<CopyDetailProps>
        style={{ marginLeft: '45px' }}
        isVirtualized
        limit={5}
        data={data}
        columns={[
          {
            minWidth: 120,
            // width: 165,
            Header: t('商品名'),
            accessor: (d) => {
              if (d.isCombine)
                return (
                  <div className='b-combine-goods-row-tootips'>{d.name}</div>
                )
              return d.name
            },
          },
          {
            minWidth: 80,
            Header: t('下单数'),
            accessor: 'count',
          },
          {
            minWidth: 80,
            Header: t('下单单位'),
            accessor: 'unit_name',
          },
          {
            minWidth: 100,
            Header: t('单价(元)'),
            // accessor: 'price',
            accessor: (d) => {
              return d.price + Price.getUnit() + '/' + d.fee_unit_name
            },
          },
        ]}
      />
    )
  },
)

export default CopyDetail
