import React, { FC, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { FormGroup } from '@gm-pc/react'
import { gmHistory, useGMLocation } from '@gm-common/router'
import { t } from 'gm-i18n'

import AccountInfo from './components/account_info'
import FinanceInfo from './components/finance_info'
import OperationInfo from './components/operation_info'
import DinnerInfo from './components/dinner_info'
import OrderRuleInfo from './components/order_rule_info'
import CreateStore from './store'
import { CustomerDetailLocationQuery } from './index.page'
import globalStore from '@/stores/global'
import InvoiceInfo from './components/invoice_info'

const store = new CreateStore({ viewType: 'Create' })
const Create: FC = observer(() => {
  const location = useGMLocation<CustomerDetailLocationQuery>()
  const { type, customer_id } = location.query
  const form1 = useRef(null)
  const form2 = useRef(null)
  const form3 = useRef(null)
  const form4 = useRef(null)
  const form5 = useRef(null)
  const form6 = useRef(null)

  useEffect(() => {
    store.fetchGetCategoryTree()
    store.fetchServicePeriod()
    store.fetchListGroupUser()
    store.fetchQuotation()
    store.fetchMealTimesList()
    type === 'createChildCustomer' && store.fetchCustomer(customer_id)
    return () => store.init()
  }, [])
  const cityIds = globalStore.stationInfo.attrs?.available_city_ids
  useEffect(() => {
    if (cityIds) {
      store.setDefaultAddress(cityIds)
    }
  }, [cityIds])
  const _handleCancel = () => {
    gmHistory.push('/customer/society/catering_customer_management')
  }
  const _handleCreate = () => {
    if (type === 'createParentCustomer') {
      if (!store.verification('create')) {
        return
      }
      if (store.isOrderLimit && !store.orderLimitVerification()) {
        return
      }
      store.createCustomer().then((json) => {
        if (json) {
          _handleCancel()
        }
        return null
      })
    } else if (type === 'createChildCustomer') {
      if (!store.verification('update')) {
        return
      }
      if (store.isOrderLimit && !store.orderLimitVerification()) {
        return
      }
      store.createChildCustomer().then((json) => {
        if (json?.customer) {
          _handleCancel()
        }
        return null
      })
    } else {
      store.updateCustomer().then(() => _handleCancel())
    }
  }
  return (
    <FormGroup
      formRefs={[form1, form2, form3, form4, form5]}
      onSubmit={_handleCreate}
      onCancel={_handleCancel}
      saveText={t('保存')}
    >
      {!globalStore.isLite && <AccountInfo ref={form1} store={store} />}
      {globalStore.isLite && <InvoiceInfo ref={form6} store={store} />}
      {!globalStore.isLite && <FinanceInfo ref={form2} store={store} />}
      <OperationInfo ref={form3} store={store} />
      {!globalStore.isLite && <DinnerInfo ref={form4} store={store} />}
      {store.isOrderLimit && <OrderRuleInfo ref={form5} store={store} />}
    </FormGroup>
  )
})

export default Create
