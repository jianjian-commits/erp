import React from 'react'
import { observer } from 'mobx-react'

import Filter from './components/filter'
import ChartPanel from './components/chart_panel'

const Schedule = observer(() => {
  return (
    <>
      <Filter />
      <ChartPanel />
    </>
  )
})

export default Schedule
