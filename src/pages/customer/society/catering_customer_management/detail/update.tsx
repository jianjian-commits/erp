import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { FormGroup, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { gmHistory } from '@gm-common/router'

import AccountInfo from './components/account_info'
import FinanceInfo from './components/finance_info'
import OperationInfo from './components/operation_info'
import DinnerInfo from './components/dinner_info'
import OrderRuleInfo from './components/order_rule_info'
import UpdateStore from './store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import InvoiceInfo from './components/invoice_info'

interface UpdateProps {
  customer_id: string
}

const store = new UpdateStore({ viewType: 'Update' })

const Update: FC<UpdateProps> = observer(({ customer_id }) => {
  const form1 = useRef(null)
  const form2 = useRef(null)
  const form3 = useRef(null)
  const form4 = useRef(null)
  const form5 = useRef(null)
  const form6 = useRef(null)

  const getCategoryTree = async () => {
    await store.fetchGetCategoryTree()
  }
  useEffect(() => {
    getCategoryTree()
    store.fetchDetail(customer_id)
    store.fetchServicePeriod()
    store.fetchListGroupUser()
    store.fetchQuotation()
    store.fetchListCustomerUser([customer_id])
    store.fetchMealTimesList()
    return () => store.init()
  }, [])

  const _handleCancel = () => {
    gmHistory.go(-1)
  }
  const _handleSave = () => {
    if (!store.verification('update')) {
      return
    }
    if (store.isOrderLimit && !store.orderLimitVerification()) {
      return
    }
    store.updateCustomer().then(() => {
      Tip.success(t('保存成功'))
      return _handleCancel()
    })
  }
  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_UPDATE_CUSTOMER,
        )
      }
      formRefs={[form1, form2, form3, form4]}
      onSubmit={_handleSave}
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

export default Update
