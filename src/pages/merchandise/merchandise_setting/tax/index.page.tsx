import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import Filter from './components/filter'
import List from './components/list'

const TaxList = observer(() => {
  useEffect(() => {
    async function getFinanceCategory() {
      await store.getFinanceCategoryTree()
    }
    getFinanceCategory()
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
})

export default TaxList
