import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import List from './component/list'
import Filter from './component/filter'
import { usePagination } from '@gm-common/hooks'
import type { ListQuotationRequest } from 'gm_api/src/merchandise'

const ViewBySheet: FC = observer(() => {
  const { pagination, refresh, run } = usePagination<ListQuotationRequest>(
    (params) => {
      return store.fetchPriceList(params)
    },
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    return () => {
      store.resetData()
    }
  }, [])

  return (
    <div>
      <Filter onSearch={run} />
      <List refresh={refresh} pagination={pagination} />
    </div>
  )
})

export default ViewBySheet
