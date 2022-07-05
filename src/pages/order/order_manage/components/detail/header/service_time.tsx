import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Select, Confirm, Flex } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import moment from 'moment'
import { getReceiveTime } from '../util'
import { getCustomerStatus, isValidOrderTime } from '@/pages/order/util'
import store from '../store'
import {
  Customer_Type,
  ListCustomer,
  ServicePeriod,
  ServicePeriod_Type,
} from 'gm_api/src/enterprise'
import { Filters_Bool } from 'gm_api/src/common'

const ServiceTime = observer(() => {
  const [servicePeriods, setServicePeriods] = useState<ServicePeriod[]>([])
  useEffect(() => {
    const { customer } = store.order
    if (!customer?.service_periods) {
      ListCustomer({
        paging: { limit: 999 },
        need_service_periods: true,
        q: customer?.value || '',
        is_bill_target: Filters_Bool.ALL,
        is_ship_target: Filters_Bool.ALL,
        type: Customer_Type.TYPE_SOCIAL,
        need_quotations: true,
        bind_quotation_periodic: Filters_Bool.TRUE,
        bind_quotation_without_time: Filters_Bool.TRUE,
        need_parent_customers: true,
      }).then((json) => {
        const relation = json.response.service_period_relation || {}
        const servicePeriodMap = json.response.service_periods || {}
        const servicePeriodIds = relation[customer?.value!]?.values || []
        setServicePeriods(
          servicePeriodIds
            .map((id) => servicePeriodMap[id])
            .filter((v) => v.type === ServicePeriod_Type.TYPE_UNSPECIFIED),
        )
      })
    }
  }, [])
  const handleServiceTimeChange = async (value: string) => {
    const { order, list } = store
    if (
      value &&
      order.service_period_id &&
      list.filter((v) => v.sku_id && v.unit_id).length
    ) {
      await Confirm({
        title: t('警告'),
        children: t('切换运营时间将清空商品列表，是否继续？'),
      }).then(() => {
        store.setList()
        return null
      })
    }
    const servicePeriod = _.find(
      order.customer?.service_periods,
      (v) => v.service_period_id === value,
    )
    if (!servicePeriod) return Promise.reject(new Error('error servicePeriod'))
    const { receiveTime } = getReceiveTime(servicePeriod!, order.order_time)
    store.updateOrderInfo('service_period_id', value)
    store.updateOrderInfo('service_period', servicePeriod)
    store.updateOrderInfo('receive_time', receiveTime)
    if (store.order.repair) {
      store.updateOrderInfo(
        'order_time',
        `${+moment()
          .startOf('day')
          .add(servicePeriod.order_create_min_time, 'ms')
          .toDate()}`,
      )
    }
    return null
  }
  if (store.order.view_type !== 'create') {
    return <Flex alignCenter>{store.order?.service_period?.name || '-'}</Flex>
  }
  const { order } = store
  return (
    <Flex flex alignCenter>
      <Select
        style={{ minWidth: 175 }}
        value={order.service_period_id}
        onChange={handleServiceTimeChange}
        disabled={!order.customer || !!getCustomerStatus(order.customer!).type}
        data={[
          { text: t('请选择运营时间'), value: '' },
          ...(store.order?.customer?.service_periods || servicePeriods).map(
            (v) => ({
              ...v,
              text: v.name,
              value: v.service_period_id,
            }),
          ),
        ]}
      />
      {!order.repair &&
        order.service_period &&
        !isValidOrderTime(order.service_period) && (
          <div className='gm-padding-left-5 gm-text-danger'>
            当前运营时间无法下单
          </div>
        )}
    </Flex>
  )
})

export default ServiceTime
