import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate, PrintingTemplate_Type } from 'gm_api/src/preference'
import { history } from '@/common/service'

const SortingLabelTemplate = observer(() => {
  const handleConfigRelation = (tpl: PrintingTemplate) => {
    history.push({
      pathname: '/system/template/print_template/relation_config',
      query: {
        printing_template_id: tpl.printing_template_id,
      },
    })
  }

  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_SORTING}
      url='#/system/template/print_template/sorting_label_template/edit'
      panelTitle={t('分拣标签')}
      setDefaultTemplate
      handleCustomerSetting={handleConfigRelation}
      setSupplierTemplate
    />
  )
})

export default SortingLabelTemplate
