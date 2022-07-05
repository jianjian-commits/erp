import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './store'

const ProcessManage: FC = observer(() => {
  const { pagination, run } = usePagination<any>(store.getProcessList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'processes',
  })

  useEffect(() => {
    store.getProcessTypeList()
    store.setDoRequest(run)
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
})

export default ProcessManage
