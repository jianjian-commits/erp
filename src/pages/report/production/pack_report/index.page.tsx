import React, { FC, useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const PackReport: FC<{}> = observer(() => {
  const { pagination, run } = usePagination<any>(
    (params) => store.fetchPackReport(params),
    {
      defaultPaging: {
        limit: 10,
        need_count: true,
      },
      paginationKey: 'pack_report',
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
      <List pagination={pagination} />
    </>
  )
})

export default PackReport
