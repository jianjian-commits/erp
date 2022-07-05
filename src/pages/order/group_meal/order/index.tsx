import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'
import store from './store'
import Filter from './component/filter'
import List from './component/list'
import { ComponentProps } from '../interface'

const StudentList: FC<ComponentProps> = observer(({ customer_type }) => {
  useEffect(() => {
    store.setCustomerType(customer_type)
  }, [])

  const { pagination, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    run()

    return () => store.init()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List onSearch={run} pagination={pagination} />
    </>
  )
})

export default StudentList
