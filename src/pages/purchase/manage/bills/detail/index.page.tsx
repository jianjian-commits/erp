import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex, Loading } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import Header from '../bill/header'
import List from '../bill/list'
import store from '../bill/store'
import type { Query } from '../../../interface'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { GetPurchaseSettings } from 'gm_api/src/preference'

const Detail = () => {
  const location = useGMLocation<Query>()
  useEffect(() => {
    store
      .fetchBill(location.query.id)
      .then(() => GetPurchaseSettings({}))
      .then((res) => {
        const state =
          res.response.purchase_settings
            .purchase_task_price_equal_quotation_price === 2
        return store.setAgreementPriceState(state)
      })

    return () => {
      store.init()
    }
  }, [location.query.id])
  if (store.loading) {
    return (
      <Flex justifyCenter style={{ marginTop: 50 }}>
        <Loading size='40' />
      </Flex>
    )
  }
  return (
    <>
      <Header
        disabledEdit={
          !globalStore.hasPermission(
            Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_SHEET,
          )
        }
      />
      <List />
    </>
  )
}

export default observer(Detail)
