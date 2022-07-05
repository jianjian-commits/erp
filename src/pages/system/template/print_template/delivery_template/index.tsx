import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import TemplateList from '../components/temList'
import { RightSideModal } from '@gm-pc/react'
import { PrintingTemplate_Type, PrintingTemplate } from 'gm_api/src/preference'
import CustomerSettingModal from './components/customer_setting_modal'
import globalStore from '@/stores/global'

const DeliveryTemplate = observer(() => {
  const handleCustomerSetting = (tpl: PrintingTemplate) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      children: (
        <CustomerSettingModal
          templateId={tpl.printing_template_id}
          templateDeliveryType={tpl.template_delivery_type}
          onHide={RightSideModal.hide}
        />
      ),
    })
  }
  return (
    <TemplateList
      type={PrintingTemplate_Type.TYPE_DELIVERY}
      url='#/system/template/print_template/delivery_template/edit'
      urlTranscript={{
        1: '#/system/template/print_template/account_template/edit',
        2: '#/system/template/print_template/delivery_template/edit',
      }}
      panelTitle={t('配送模板列表')}
      setDefaultTemplate
      handleCustomerSetting={handleCustomerSetting}
      setSupplierTemplate
      templateTypeTip={t(
        '表示该模板是针对单一商户的配送单模板（商户配送单），或是账户合并打印配送单（账户配送单）的模板。新建后模板类型不可更改',
      )}
      // @ts-ignore
      templateList={[
        !globalStore.isLite && { value: 1, text: t('账户配送单') },
        { value: 2, text: t('商户配送单') },
      ].filter(Boolean)}
    />
  )
})

export default DeliveryTemplate
