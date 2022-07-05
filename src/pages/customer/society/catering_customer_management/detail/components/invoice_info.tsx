/*
 * @Description: 发票信息
 */
import React, { ChangeEvent, forwardRef } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { FormPanel, Form, FormItem, Input, FormBlock } from '@gm-pc/react'
import { ChinaVatInvoice } from 'gm_api/src/enterprise'
import { CustomerStoreInstance } from '../../detail/store'

interface AccountProps {
  store: CustomerStoreInstance
}
type FormItemKey = keyof ChinaVatInvoice

const InvoiceInfo = observer(
  forwardRef<Form, AccountProps>(({ store }, ref) => {
    const { childCustomer, setChildCustomer } = store
    const china_vat_invoice = childCustomer?.settlement?.china_vat_invoice
    const formConfigs: {
      label: string
      key: FormItemKey
      maxLength?: number
    }[][] = [
      [
        {
          label: t('发票抬头'),
          key: 'company_name',
        },
        {
          label: t('税号'),
          key: 'business_license_number',
        },
      ],
      [
        {
          label: t('公司电话'),
          key: 'company_phone',
          maxLength: 11,
        },
        {
          label: t('公司地址'),
          key: 'company_address',
        },
      ],
      [
        {
          label: t('开户银行'),
          key: 'bank_name',
        },
        {
          label: t('开户账号'),
          key: 'bank_account',
        },
      ],
    ]

    const onChange = (key: FormItemKey, e: ChangeEvent<HTMLInputElement>) => {
      setChildCustomer(`settlement.china_vat_invoice.${key}`, e.target.value)
    }

    return (
      <FormPanel title={t('发票信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          {formConfigs.map((formConfig, index) => (
            <FormBlock col={2} key={index}>
              {formConfig.map(({ label, key, maxLength }) => (
                <FormItem label={label} key={key}>
                  <Input
                    value={china_vat_invoice?.[key]}
                    onChange={onChange.bind(null, key)}
                    type='text'
                    maxLength={maxLength || 30}
                  />
                </FormItem>
              ))}
            </FormBlock>
          ))}
        </Form>
      </FormPanel>
    )
  }),
)

export default InvoiceInfo
