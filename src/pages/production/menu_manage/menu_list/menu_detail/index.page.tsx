import React, { useEffect } from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'
import { useGMLocation } from '@gm-common/router'
import { Flex } from '@gm-pc/react'

const MenuDetail = observer(() => {
  const location = useGMLocation<{ menu_id: string }>()
  const { menu_id } = location.query
  const { begin, end } = store.effectCycle

  useEffect(() => {
    Promise.all([
      store.fetchListMenuPeriodGroup(),
      store.fetchMenu(menu_id),
      store.fetchList(menu_id),
    ]).then((mpJson) => {
      return mpJson
    })

    return () => {
      store.clear()
    }
  }, [menu_id])

  return (
    <>
      <Filter menu_id={menu_id} />
      <Flex
        className='gm-padding-10 gm-padding-left-20 gm-bg-info'
        alignCenter
      >{`通知：菜谱生效中，生效时间${moment(begin).format('MM月DD日')}~${moment(
        end,
      ).format(
        'MM月DD日',
      )}，生效期间，菜谱中商品仅可编辑配比和生成订单。`}</Flex>
      <List />
    </>
  )
})

export default MenuDetail
