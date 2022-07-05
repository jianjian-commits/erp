import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'
import { setTitle } from '@gm-common/tool'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const AgreementPriceList: FC = observer(() => {
  const { paging, pagination, run } = usePagination<any>(
    (params) => store.fetchList(params),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  const {
    query: { customer_id },
  } = useGMLocation<{ customer_id: string }>()

  useEffect(() => {
    runInAction(() => {
      store.customerId = customer_id
      run && run()
    })

    return () => store.reset()
  }, [customer_id])

  return (
    <>
      <Filter onSearch={run} />
      <List run={run} paging={paging} pagination={pagination} />
    </>
  )
})

export default AgreementPriceList
