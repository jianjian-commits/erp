import React, { FC, useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'

import Filter from './components/filter'
import List from './components/list'
import store from './store'

const ProcessYield: FC<{}> = observer(() => {
  const { paging, runChangePaging, run } = usePagination<any>(
    (params) => store.fetchProcessYieldReport(params),
    {
      defaultPaging: {
        need_count: true,
        limit: 1,
      },
      paginationKey: 'process_yield',
    },
  )

  useEffect(() => {
    store.setDoRequest(run)
    run()

    return () => {
      store.clear()
    }
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List />
    </>
  )
})

export default ProcessYield
