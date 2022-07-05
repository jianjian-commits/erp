import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const DeliveryTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_PURCHASE_TASK}
      url='#system/template/print_template/purchase_task_template/edit'
      panelTitle={t('采购计划模板列表')}
      setDefaultTemplate
    />
  )
})

export default DeliveryTemplate
