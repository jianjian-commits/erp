/*
 * @Description: 分类销售情况
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useTableListRef, useUpdateEffect } from '@/common/hooks'

import { Filter, List } from './components'

import store, { CategoryReportTab } from './store'

const CategoryTab: FC<{ category: CategoryReportTab }> = observer(
  ({ category }) => {
    const tableRef = useTableListRef()

    useUpdateEffect(() => {
      // didMount后tab被点击才refresh
      category === store.activeTab && tableRef.current.refresh()
    }, [category, store.activeTab])

    const onExport = () => {
      const diyShowMap = tableRef.current?.getDiyShowMap()
      return store.exportList(diyShowMap)
    }

    return (
      <>
        <Filter onExport={onExport} category={category} />
        <List tableRef={tableRef} category={category} />
      </>
    )
  },
)

export default CategoryTab
