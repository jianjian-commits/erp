import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { useGMLocation } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import moment from 'moment'
import Filter from './components/filter'
import List from './components/list'

const VegetablesMenuDetail = observer(() => {
  const location = useGMLocation<{ quotation_id: string }>()
  const { quotation_id } = location.query
  const { valid_end, valid_start } = store.quotation

  useEffect(() => {
    store.changeFilter('quotation_id', quotation_id)
    store.getQuotation(quotation_id)

    return () => {
      store.init()
    }
  }, [quotation_id])

  return (
    <>
      <Filter />
      <Flex
        className='gm-padding-10 gm-padding-left-20 gm-bg-info'
        alignCenter
      >{`通知：菜谱生效中，生效时间${moment(valid_start).format(
        'MM月DD日',
      )}~${moment(valid_end).format('MM月DD日')}`}</Flex>
      <List />
    </>
  )
})

export default VegetablesMenuDetail
