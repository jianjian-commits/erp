import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { ComponentProps } from '../../interface'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import store from './store'
import Header from './components/header'
import List from './components/list'
import { BoxPanel } from '@gm-pc/react'

const Detail: FC<ComponentProps> = observer(({ customer_type }) => {
  const location = useGMLocation<{ serial_no: string }>()
  const { serial_no } = location.query

  useEffect(() => {
    store.setCustomerType(customer_type)
    store.getServicePeriodList().then(() => {
      store.getOrderDetail(serial_no)
      return null
    })
    return () => {
      store.clear()
    }
  }, [serial_no, customer_type])

  return (
    <>
      <Header />
      <BoxPanel
        title={t('订单明细')}
        summary={[{ text: t('商品列表'), value: store.list.length }]}
        collapse
      >
        <List />
      </BoxPanel>
    </>
  )
})

export default Detail
