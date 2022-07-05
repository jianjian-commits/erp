import React, { useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import Header from './header'
import List from './list'
import store from './store'

const Detail = () => {
  const location = useGMLocation<{
    quotation_id: string
    copy_quotation_id: string
  }>()
  const quotation_id = location.query?.quotation_id
  const copy_quotation_id = location.query?.copy_quotation_id
  useEffect(() => {
    if (quotation_id) {
      store.getQuotation(quotation_id)
      store.getSheetList(quotation_id)
    }
    if (copy_quotation_id) {
      store.getQuotation(copy_quotation_id, 'copy')
      store
        .getSheetList(copy_quotation_id)
        .then(() => store.getAllSkuUnitSelectData())
        .then(() => store.changeListEditState(true))
    }
    return () => {
      store.resetData()
    }
  }, [])
  return (
    <>
      <Header />
      {/* 没有供应商不显示表格 */}
      <Observer>
        {() => {
          const supplier_id = store.headerInfo.supplier?.supplier_id
          return <>{supplier_id && <List />}</>
        }}
      </Observer>
    </>
  )
}

export default observer(Detail)
