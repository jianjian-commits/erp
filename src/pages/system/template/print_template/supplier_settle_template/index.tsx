import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const SupplierSettleTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_SETTLEMENT}
      url='#/system/template/print_template/supplier_settle_template/edit'
      panelTitle={t('结款模板列表')}
      setDefaultTemplate
    />
  )
})

export default SupplierSettleTemplate
