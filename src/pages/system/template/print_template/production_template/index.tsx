import { t } from 'gm-i18n'
import {
  PrintingTemplate_TemplateProductionType,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { observer } from 'mobx-react'
import React from 'react'
import TemplateList from '../components/temList'
import { MergeType } from './interface'

const CannibalizeTemplate = observer(() => {
  const defaultUrl = `#/system/template/print_template/production_template/edit?template_type=${MergeType.TYPE_MATERIAL}&template_production_type=${PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD}`
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_PRODUCTION}
      url={defaultUrl}
      urlTranscript={{
        [PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD]:
          defaultUrl, // 单品
        [PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN]: `#/system/template/print_template/production_template/edit?template_type=${MergeType.TYPE_FINISH_PRODUCT}&template_production_type=${PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN}`, // 组合
        [PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_PACK]: `#/system/template/print_template/production_template/edit?template_type=${MergeType.TYPE_PACK}&template_production_type=${PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_PACK}`, // 包装
      }}
      panelTitle={t('生产单据模板列表')}
      setDefaultTemplate
      templateList={[
        {
          value:
            PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_CLEANFOOD,
          text: t('单品生产'),
        },
        {
          value:
            PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_DELICATESSEN,
          text: t('组合生产'),
        },
        {
          value: PrintingTemplate_TemplateProductionType.TEMPLATE_TYPE_PACK,
          text: t('包装'),
        },
      ]}
    />
  )
})

export default CannibalizeTemplate
