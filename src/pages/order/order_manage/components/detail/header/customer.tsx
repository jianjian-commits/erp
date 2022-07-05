import { t } from 'gm-i18n'
import moment from 'moment'
import _ from 'lodash'
import React, { useRef, useEffect } from 'react'
import { Flex, MoreSelect, Tip } from '@gm-pc/react'
import {
  ListCustomer,
  Customer_Status,
  ServicePeriod_Type,
  Customer_Type,
} from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import store from '../store'
import { getReceiveTime } from '../util'
import CustomerStatus from './customer_status'
import { getCustomerStatus } from '@/pages/order/util'
import globalStore from '@/stores/global'

import type { Customer } from '../../interface'
import { Filters_Bool } from 'gm_api/src/common'
import {
  ListQuotationV2,
  Quotation_Status,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { list2Map } from '@/common/util'

const Component = () => {
  const targetRef = useRef<MoreSelect>(null)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = (value?: string) => {
    return ListCustomer({
      paging: { limit: 999 },
      need_service_periods: true,
      q: value || '',
      is_bill_target: Filters_Bool.ALL,
      is_ship_target: Filters_Bool.ALL,
      type: Customer_Type.TYPE_SOCIAL,
      need_quotations: true,
      bind_quotation_without_time: Filters_Bool.TRUE,
      need_parent_customers: true,
      bind_quotation_periodic: Filters_Bool.TRUE,
    }).then(async (json) => {
      const relation = json.response.service_period_relation || {}
      const servicePeriodMap = json.response.service_periods || {}
      const quotationRelations = json.response.quotation_relations || []

      const quotations = (
        await ListQuotationV2({
          paging: { limit: 999 },
          filter_params: {
            // 过滤周期报价单的子报价单
            parent_quotation_ids: ['0'],
            quotation_types: [
              Quotation_Type.WITHOUT_TIME,
              Quotation_Type.PERIODIC,
            ],
            quotation_status: Quotation_Status.STATUS_VALID,
          },
        })
      ).response.quotations

      const quotationsMap = list2Map(quotations!, 'quotation_id')
      const list = (json.response.customers || [])
        .filter(
          (v) => (+v.status! & 512) === Customer_Status.STATUS_IS_SHIP_TARGET,
        )
        .map((v) => {
          const servicePeriodIds = relation[v.customer_id!]?.values || []
          const target = _.find(
            _.filter(quotationRelations, (quotation) => {
              const { quotation_type } = quotation
              return (
                quotation_type === Quotation_Type.WITHOUT_TIME ||
                quotation_type === Quotation_Type.PERIODIC
              )
            }),
            (q) =>
              q.customer_id === v.customer_id &&
              q.station_id === globalStore.userInfo.station_id,
          )

          let settlement = v.settlement
          if (v.level === 2) {
            // 此时发票信息带在 父 customer 身上，需要从父customer身上找
            const parent = (json.response.parent_customers || {})[v.parent_id!]
            settlement = {
              ...settlement,
              china_vat_invoice: {
                ...parent?.settlement?.china_vat_invoice!,
              },
            }
          }
          return {
            ...v,
            service_periods: servicePeriodIds
              .map((id) => servicePeriodMap[id])
              .filter((v) => v.type === ServicePeriod_Type.TYPE_UNSPECIFIED),
            quotation: quotationsMap[target?.quotation_id!] || {},
            value: v.customer_id,
            text: `${v.name}(${v.customized_code})`,
            settlement,
          }
        })
      store.setCustomerList(list)
      return null
    })
  }
  const handleSelect = async (selected: Customer) => {
    const servicePeriods = selected?.service_periods || []
    store.updateOrderInfo('customer', selected)
    store.updateOrderInfo(
      'quotation_id',
      selected?.quotation?.quotation_id || '',
    )
    store.updateOrderInfo('service_period_id', '')
    store.updateOrderInfo('service_period', undefined)
    store.updateOrderInfo('receive_time', undefined)
    const { quotation } = selected || {}

    if (quotation) {
      const invalid = quotation.status !== Quotation_Status.STATUS_VALID
      const isPeriodic = quotation.type === Quotation_Type.PERIODIC
      const notProgress = !quotation.child_quotation_available
      if (invalid || (isPeriodic && notProgress)) {
        Tip.danger(t('该客户绑定的报价单未激活，无法下单'))
        return
      }
    } // 商户绑定的报价单未激活不能下单
    store.setList()
    if (getCustomerStatus(selected).type) return // 商户状态不正常
    const servicePeriod =
      servicePeriods.length === 1 ? servicePeriods[0] : undefined
    if (servicePeriod) {
      store.updateOrderInfo(
        'service_period_id',
        servicePeriod?.service_period_id || '',
      )
      const { receiveTime } = getReceiveTime(servicePeriod)
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
    }
  }
  useEffect(() => {
    if (store.order.view_type === 'create') {
      handleSearch()
    }
  }, [])
  const { view_type, customer } = store.order
  if (view_type !== 'create') {
    return <Flex flex>{customer?.text || '-'}</Flex>
  }

  return (
    <Flex flex alignCenter>
      <MoreSelect
        style={{ minWidth: 140 }}
        ref={targetRef}
        data={store.customerList}
        selected={customer}
        onSearch={handleSearch}
        onSelect={handleSelect}
        placeholder={t('输入客户编码，客户名搜索')}
      />
      {customer && <CustomerStatus customer={customer} />}
    </Flex>
  )
}

export default observer(Component)
