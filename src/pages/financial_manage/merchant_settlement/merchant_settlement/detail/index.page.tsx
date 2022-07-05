import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { BoxPanel } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { t } from 'gm-i18n'
import { setTitle } from '@gm-common/tool'
import store from './store'
import Header from './components/header'
import OrderList from './components/order_list'
import TransactionFlow from './components/transaction_flow'

// setTitle(t('对账单详情'))

const Settlement = observer(() => {
  const location = useGMLocation<{ serial_no: string }>()
  const { serial_no } = location.query
  useEffect(() => {
    store.fetchSettleSheetDetail(serial_no)
    return () => {}
  }, [])
  return (
    <>
      <Header type='VIEW' />
      <BoxPanel title={t('订单列表')} collapse>
        <OrderList />
      </BoxPanel>
      <BoxPanel title={t('交易流水')} collapse>
        <TransactionFlow />
      </BoxPanel>
    </>
  )
})

export default Settlement
