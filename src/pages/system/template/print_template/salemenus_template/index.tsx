import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const SalemenusTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_QUOTATION}
      url='#system/template/print_template/salemenus_template/edit'
      panelTitle={t('报价单模板')}
      setDefaultTemplate
    />
  )
})

export default SalemenusTemplate
