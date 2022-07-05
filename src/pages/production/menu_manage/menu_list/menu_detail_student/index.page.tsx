import React, { useEffect } from 'react'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import store from './store'
import Filter from './components/filter'
import List from './components/list'

const MenuDetailStudent = observer(() => {
  const location = useGMLocation<{ menu_id: string }>()
  const { menu_id } = location.query
  useEffect(() => {
    Promise.all([
      store.fetchList(menu_id),
      store.fetchHolidayList(),
      store.getMenu(menu_id),
    ]).then(() => store.generateMenuList(menu_id))

    return () => {
      store.initData()
    }
  }, [menu_id])

  return (
    <>
      <Filter menu_id={menu_id} />
      <List />
    </>
  )
})

export default MenuDetailStudent
