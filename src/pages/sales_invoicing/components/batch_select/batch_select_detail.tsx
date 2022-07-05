import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'

import DetailTable from './batch_detail_table'
import { BatchData } from './util'
import { ListRoute, Route } from 'gm_api/src/delivery'
import { ListCustomer, Customer } from 'gm_api/src/enterprise'

interface Props {
  productInfo: {
    skuBaseUnitName: string
    skuBaseCount: number
  }
  hasSkuUnit?: boolean
  hasCustomer?: boolean
  data: BatchData[]
  type?: 'refund_stock_in' | 'inventory'
}

const formType = [{ value: 1, text: 'inventory' }]

const BatchSelectDetail: FC<Props> = (props) => {
  const {
    data,
    hasSkuUnit,
    hasCustomer,
    productInfo: { skuBaseCount, skuBaseUnitName },
    type,
  } = props

  console.log(data, 'data.......111')

  const [customerList, setCustomerList] = useState<Customer[]>([])
  const [routeList, setRouteList] = useState<Route[]>([])

  const isInventory = _.find(formType, (v) => v.text === type!)?.value === 1
  const isRefundStockIn = type === 'refund_stock_in'

  useEffect(() => {
    if (hasCustomer) {
      ListRoute({ paging: { limit: 999 } }).then((json) => {
        setRouteList(json.response.routes)
        return null
      })

      ListCustomer({ paging: { limit: 999 } }).then((json) => {
        setCustomerList(json.response.customers)
        return null
      })
    }
  }, [])

  return (
    <Flex column>
      {!isInventory && (
        <Flex className='gm-margin-10'>
          <div className='gm-margin-right-10'>
            {isRefundStockIn ? t('入库数：') : t('出库数：')}&nbsp;
            {skuBaseCount + skuBaseUnitName}
          </div>
        </Flex>
      )}
      {/* 已选择的表格数据 */}
      <DetailTable
        data={data}
        hasSkuUnit={hasSkuUnit}
        type={type}
        hasCustomer={hasCustomer}
        someInfo={{
          customerList,
          routeList,
        }}
      />
    </Flex>
  )
}

export default BatchSelectDetail
