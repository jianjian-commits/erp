import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import { usePagination } from '@gm-common/hooks'
import store from './store'

const QuotationLog = () => {
  const { pagination, run } = usePagination<any>(store.fetchBasicPrices, {
    paginationKey: 'quotation_log',
    defaultPaging: {
      need_count: true,
    },
  })
  useEffect(() => {
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}

export default QuotationLog
