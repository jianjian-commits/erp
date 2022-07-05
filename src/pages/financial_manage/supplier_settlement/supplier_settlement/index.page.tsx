import { FullTabs } from '@gm-pc/frame'
import { t } from 'gm-i18n'
import React, { useEffect } from 'react'

import UnHandleReceipt from './un_handle_receipt'
import PaidReceipt from './paid_receipt'
import { setTitle } from '@gm-common/tool'

const SupplierSettlement = () => {
  useEffect(() => {
    setTitle('供应商结算')
  })
  return (
    <FullTabs
      defaultActive='un_handle_receipt'
      tabs={[
        {
          text: t('待处理单据'),
          value: 'un_handle_receipt',
          children: <UnHandleReceipt />,
        },
        {
          text: t('结款单据'),
          value: 'paid_receipt',
          children: <PaidReceipt />,
        },
      ]}
    />
  )
}

export default SupplierSettlement
