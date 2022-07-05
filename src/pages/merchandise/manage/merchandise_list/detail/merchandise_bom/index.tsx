import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import ListV2 from './components/list'
import store from './store'

const MerchandiseBom: FC = observer(() => {
  const { clearStore } = store
  useEffect(() => {
    return () => clearStore()
  }, [])
  return (
    <>
      <Filter />
      <ListV2 />
    </>
  )
})

export default MerchandiseBom
