import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { PrintingTemplate_Type } from 'gm_api/src/preference'

const StockInTemplate = observer(() => {
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_IN_STOCK}
      url='#system/template/print_template/stock_in_template/edit'
      panelTitle={t('入库单据模板列表')}
      setDefaultTemplate
    />
  )
})

export default StockInTemplate
