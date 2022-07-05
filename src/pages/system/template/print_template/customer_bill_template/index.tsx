import TemplateList from '@/pages/system/template/print_template/components/temList'
import { t } from 'gm-i18n'
import { PrintingTemplate_Type } from 'gm_api/src/preference'
import React from 'react'

/**
 * 财务模块 - 客户账单
 */
const CustomerBillTemplate: React.FC = () => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_BILL}
      url='#system/template/print_template/customer_bill_template/edit'
      panelTitle={t('账单模板')}
      setDefaultTemplate
    />
  )
}

export default CustomerBillTemplate
