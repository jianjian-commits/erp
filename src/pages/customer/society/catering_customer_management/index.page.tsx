import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const ExternalCustomerManagement: FC = observer(() => {
  const { paging, pagination, run } = usePagination<any>(
    (params) => store.fetchList(params),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    store.fetchQuotation()
    store.fetchServicePeriod()
    run && run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List run={run} paging={paging} pagination={pagination} />
    </>
  )
})

export default ExternalCustomerManagement
