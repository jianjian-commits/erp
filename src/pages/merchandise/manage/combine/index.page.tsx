/**
 * @description 组合商品列表
 */
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import ListV2 from './components/listV2'
import './style.less'
import store from './store'

const CombineList = observer(() => {
  const { clearStore } = store

  useEffect(() => {
    return () => {
      clearStore()
    }
  }, [])
  return (
    <>
      <Filter />
      <ListV2 />
    </>
  )
})

export default CombineList
