import React, { useEffect } from 'react'
import Filter from './filter'
import TreeTable from './tree/tree_table'
import store from './store'
import './style.less'
import { observer } from 'mobx-react'

/** 分类管理 */
const CategoryManage = () => {
  useEffect(() => {
    fetchData()
    return () => store.clearStore()
  }, [])

  const fetchData = async () => {
    await store.getIconList()
    await store.getTreeData()
  }

  return (
    <div>
      <Filter />
      <TreeTable />
    </div>
  )
}

export default observer(CategoryManage)
