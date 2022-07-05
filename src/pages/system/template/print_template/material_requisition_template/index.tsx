import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const MaterialRequisitionTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_MATERIAL}
      url='#system/template/print_template/material_requisition_template/edit'
      panelTitle={t('领料单据模板列表')}
      setDefaultTemplate
    />
  )
})

export default MaterialRequisitionTemplate
