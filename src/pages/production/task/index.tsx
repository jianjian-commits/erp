import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'
import { map_Task_Type, Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter/filter'
import List from './components/list/list'
import store from './store'

interface Props {
  type?: Task_Type
}

const Task: FC<Props> = observer(({ type }) => {
  const { pagination, runChangePaging, run, refresh } = usePagination<any>(
    (params) => store.fetchTaskList(params, type),
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: map_Task_Type[type ?? Task_Type.TYPE_PRODUCE],
    },
  )
  useEffect(() => {
    store.setDoRequest(refresh)
    run()
    return () => {
      store.init()
    }
  }, [])

  return (
    <>
      <Filter onSearch={run} type={type} />
      <List type={type} />
      <BoxPagination>
        <Pagination paging={pagination.paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})

export default Task
