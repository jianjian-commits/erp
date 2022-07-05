import React, { useEffect } from 'react'
import List from './list'
import Filter from './filter'
import store from './store'
import { Quotation_Type } from 'gm_api/src/merchandise'
import baseStore from '../store'

const Client = () => {
  useEffect(() => {
    const quotationId =
      baseStore.type === Quotation_Type.PERIODIC
        ? baseStore.parentQuotation.quotation_id
        : baseStore.quotation.quotation_id
    // 先拉取 客户Label 数据 ，否则 Filter 组件中 的select 会有显示问题
    store.fetchCustomerLabelList().then(() => store.fetchList())
    store.fetchServicePeriod()
    store.setQuotationId(quotationId)

    return () => store.clearStore()
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default Client
