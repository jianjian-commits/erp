import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks/src'

import Filter from './filter'
import List from './list'
import merchandiseStore from './merchandise_store'

const SortingMerchandise: FC = () => {
  const { pagination, run } = usePagination<any>(merchandiseStore.fetchList, {
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

export default observer(SortingMerchandise)
