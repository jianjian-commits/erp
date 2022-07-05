import React, { FC } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { PrintingTemplate } from 'gm_api/src/preference'
import { Radio, Tooltip } from '@gm-pc/react'
import { GroupRadioItem, commonClass } from './groupItem'
import globalStore from '@/stores/global'

type CustomerDeliveryOrderType = {
  deliveryType: string
  templateId: string
  templateList: PrintingTemplate[]
  savePrintOptions(key: string, value: string): void
}

export const CustomerDeliveryOrder: FC<CustomerDeliveryOrderType> = ({
  deliveryType,
  templateId,
  templateList,
  savePrintOptions,
}) => {
  if (deliveryType === '1') {
    templateList = _.filter(
      templateList,
      (item) => item.template_delivery_type === 2,
    )
  } else if (deliveryType === '3') {
    templateList = _.filter(
      templateList,
      (item) => item.template_delivery_type === 1,
    )
  }

  const prefixRender = () => {
    const value = deliveryType === '1' ? 'customer_config' : 'company_config'
    return (
      <Radio value={value} style={{ display: 'block' }} className={commonClass}>
        <span>
          {deliveryType === '1' ? t('按商户配置') : t('按账户配置')}
          <Tooltip
            popup={
              <div className='gm-padding-5'>
                {t('若商家未配置指定模板，则对应客户订单不会打印')}
              </div>
            }
          />
        </span>
        <a
          href='#/system/template/print_template'
          className='gm-text-12'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('配置商户>')}
        </a>
      </Radio>
    )
  }

  return (
    <>
      <div className='gm-border-bottom gm-padding-bottom-5'>
        {t('整单打印/模板选择')}
      </div>
      <GroupRadioItem
        templateList={templateList}
        value={templateId}
        onChange={(templateId) => {
          savePrintOptions('templateId', templateId)
        }}
        prefixChild={prefixRender}
      />
    </>
  )
}
