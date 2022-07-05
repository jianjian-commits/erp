import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import Big from 'big.js'
import store from '../store'
import { formatTimeStamp } from '../util'

interface DetailProps {
  index: number
}
const Detail: FC<DetailProps> = ({ index }) => {
  const { order_ids } = store.leave_list[index]?.order_ids!
  const { detail } = store
  console.warn('detail', detail)
  useEffect(() => {
    if (order_ids?.length) {
      store.fetchDetail(order_ids)
    }
  }, [])
  const columns: Column[] = [
    {
      Header: t('日期'),
      accessor: 'create_time',
      Cell: (cellProps) =>
        formatTimeStamp(cellProps.original?.create_time!, 'YYYY-MM-DD'),
    },
    {
      Header: t('餐次'),
      accessor: 'meal_times',
      Cell: (cellProps) => {
        const { service_period } = cellProps.original
        return <div>{service_period?.name!}</div>
      },
    },
    {
      Header: t('下单金额'),
      accessor: 'order_price',
      Cell: (cellProps) => {
        const { order_price } = cellProps.original
        return <div>{`${Big(order_price).toFixed(2)}元`}</div>
      },
    },
  ]
  return (
    <Flex column>
      <Table id='detail' columns={columns} data={detail} border />
    </Flex>
  )
}

export default observer(Detail)
