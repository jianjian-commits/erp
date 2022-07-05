import React, { useRef, useEffect } from 'react'
import { FormGroup, Tip, RightSideModal } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { gmHistory, useGMLocation } from '@gm-common/router'
import OrderRuleInfo from '../detail/components/order_rule_info'
import store from './store'
import globalStore from '@/stores/global'

/**
|--------------------------------------------------
|  @page
| # 批量下单限制，德保定制需求
|--------------------------------------------------
*/

interface QueryProps {
  isSelectedAll: string
  customer_ids: string
}
const IndexPage = observer(() => {
  const form1 = useRef(null)

  const location = useGMLocation<QueryProps>()
  const { customer_ids, isSelectedAll } = location.query
  const _isSelectedAll_ = JSON.parse(isSelectedAll)
  const _handleCancel = () => {
    gmHistory.go(-1)
  }

  const _handleCreate = () => {
    if (!store.orderLimitVerification()) {
      return
    }
    store
      .fetchBatchUpdateCustomer(
        _isSelectedAll_,
        _isSelectedAll_ ? undefined : JSON.parse(customer_ids),
      )
      .then(() => {
        globalStore.showTaskPanel('1')
        return _handleCancel()
      })
      .catch(() => {
        return Tip.danger(t('保存失败'))
      })
  }

  useEffect(() => {
    store.fetchGetCategoryTree()
    return () => {
      store.clear()
    }
  }, [])

  return (
    <FormGroup
      formRefs={[form1]}
      onSubmit={_handleCreate}
      onCancel={_handleCancel}
      saveText={t('保存')}
    >
      <OrderRuleInfo ref={form1} store={store} />
    </FormGroup>
  )
})

export default IndexPage
