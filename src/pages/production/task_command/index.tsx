import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'
import { map_ProduceType, ProduceType } from 'gm_api/src/production'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter/filter'
import List from './components/list/list'
import store from './store'
interface Props {
  type?: ProduceType
}
const TaskCommand: FC<Props> = ({ type }) => {
  const { pagination, runChangePaging, run, refresh } = usePagination<any>(
    (params) => store.fetchProcessTaskList(params, type),
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey:
        map_ProduceType[type ?? ProduceType.PRODUCE_TYPE_DELICATESSEN],
    },
  )

  useEffect(() => {
    store.setDoRequest(refresh)
    store.fetchFactoryModalList()
    run()
    return store.init
  }, [])

  return (
    <>
      <Filter type={type} onSearch={run} />
      <List type={type} />
      <BoxPagination>
        <Pagination paging={pagination.paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}

export default TaskCommand
