import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import SumCard from './components/sum_card'
import store from './store'

export default observer(() => {
  useEffect(() => {
    store.fetchReportList()
  }, [])
  return (
    <>
      <Filter />
      <div
        style={{ backgroundColor: '#F7F8FA' }}
        className='gm-padding-lr-20 gm-padding-tb-10'
      >
        <SumCard />
      </div>
    </>
  )
})
