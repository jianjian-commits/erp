import { observer } from 'mobx-react'
import React from 'react'

import Header from './components/header'
import List from './components/list'

const SettlementDetails = () => {
  return (
    <>
      <Header />
      <List />
    </>
  )
}

export default observer(SettlementDetails)
