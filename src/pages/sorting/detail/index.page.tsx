import React, { FC, useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import Filter from './filter'
import List from './list'

import sortingDetailStore from './store'

export interface SortingProps {}

export enum Tab {
  MERCHANDISE = 'merchandise',
  ORDER = 'order',
}

const Sorting: FC<SortingProps> = () => {
  const { pagination, run } = usePagination<any>(sortingDetailStore.fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    run()
  }, [])

  const handleSearch = () => {
    run()
  }

  return (
    <>
      <Filter onSearch={handleSearch} />
      <List onSearch={handleSearch} pagination={pagination} />
    </>
  )
}

export default Sorting
