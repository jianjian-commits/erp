import React from 'react'
import { observer } from 'mobx-react'

import store from '../store'
import { history } from '@/common/service'
import FilterHeader from '../../components/filter'

const Filter = () => {
  const { begin, end } = store.filter
  const handleSearch = () => {}

  const handleDateChange = (selected: { begin: Date; end: Date }) => {
    store.updateFilter('begin', selected.begin)
    store.updateFilter('end', selected.end)
  }

  const handleFullScreen = () => {
    store.setFullScreen(true)
    history.push('/report/production/production_schedule/full_screen')
  }
  return (
    <FilterHeader
      begin={begin}
      end={end}
      onSearch={handleSearch}
      onDateChange={handleDateChange}
      onFullScreen={handleFullScreen}
    />
  )
}

export default observer(Filter)
