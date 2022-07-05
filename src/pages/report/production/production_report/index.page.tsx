import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination, Tabs } from '@gm-pc/react'
import { Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter'
import CleanfoodList from './components/list_cleanfood'
import DelicatessenList from './components/list_delicatessen'
import store from './store'

const ProductionReport: FC<{}> = observer(() => {
  const { paging, runChangePaging, run } = usePagination<any>(
    (params) => store.fetchProductionReport(params),
    {
      defaultPaging: {
        limit: 10,
        need_count: true,
      },
      paginationKey: 'production_report',
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
      <Tabs
        active={store.tab}
        onChange={(type) => store.setTab(type)}
        tabs={[
          {
            text: '单品',
            value: Task_Type.TYPE_PRODUCE_CLEANFOOD,
            children: <></>,
          },
          {
            text: '组合',
            value: Task_Type.TYPE_PRODUCE,
            children: <></>,
          },
        ]}
      />
      <Filter onSearch={run} />
      {store.tab === Task_Type.TYPE_PRODUCE_CLEANFOOD && <CleanfoodList />}
      {store.tab === Task_Type.TYPE_PRODUCE && <DelicatessenList />}
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})

export default ProductionReport
