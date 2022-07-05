import React, { useEffect } from 'react'

import { usePagination } from '@gm-common/hooks'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const ProcessTypeManage = () => {
  const { pagination, run } = usePagination<any>(store.getProcessTypeList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'process_type',
  })

  useEffect(() => {
    store.setDoRequest(run)
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}

export default ProcessTypeManage
