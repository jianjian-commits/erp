import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const DeliveryTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_PURCHASE_SHEET}
      url='#system/template/print_template/purchase_bill_template/edit'
      panelTitle={t('采购单据模板列表')}
      setDefaultTemplate
      setSupplierTemplate
    />
  )
})

export default DeliveryTemplate
