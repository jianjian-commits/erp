import { t } from 'gm-i18n'
import React, { ChangeEvent, forwardRef } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  FormBlock,
  Switch,
  Select,
} from '@gm-pc/react'
import { CreditTypeSelect, InvoiceType } from '../../../../enum'
import { Customer, ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

interface FinanceProps {
  store: {
    parentCustomer: Customer
    setParentCustomer: (key: string, value: any) => void
    setChildCustomer: (key: string, value: any) => void
  }
}
const FinanceInfo = observer(
  forwardRef<Form, FinanceProps>(({ store }, ref) => {
    const {
      parentCustomer: { credit_type, is_frozen, is_in_whitelist, settlement },
      setParentCustomer,
      setChildCustomer,
    } = store

    return (
      <FormPanel title={t('财务信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormBlock col={2}>
            <FormItem required label={t('联系人')}>
              <Input
                className='form-control'
                value={settlement?.china_vat_invoice?.financial_contact_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setParentCustomer(
                    'settlement.china_vat_invoice.financial_contact_name',
                    e.target.value,
                  )
                }
                type='text'
                maxLength={30}
              />
            </FormItem>

            <FormItem required label={t('联系人电话')}>
              <Input
                className='form-control'
                value={settlement?.china_vat_invoice?.financial_contact_phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setParentCustomer(
                    'settlement.china_vat_invoice.financial_contact_phone',
                    e.target.value,
                  )
                }
                type='text'
                maxLength={30}
              />
            </FormItem>
            <FormItem required label={t('账期')}>
              <Select
                data={CreditTypeSelect}
                value={credit_type}
                onChange={(value: string) => {
                  // 目前子父customer账期方式保持一致
                  setParentCustomer('credit_type', value!)
                  setChildCustomer('credit_type', value!)
                }}
              />
            </FormItem>
            <FormItem required label={t('冻结状态')}>
              <Switch
                type='primary'
                on={t('冻结')}
                off={t('未冻结')}
                checked={is_frozen!}
                onChange={(e: boolean) => {
                  // 目前子父customer冻结状态保持一致
                  setParentCustomer('is_frozen', e)
                  setChildCustomer('is_frozen', e)
                }}
              />
            </FormItem>
            <FormItem
              required
              label={t('开票类型')}
              tooltip={
                <div className='gm-padding-5'>
                  <div>{t('开具发票的客户使用sku默认销项税率；')}</div>
                  <div>{t('不开专票则销项税率默认为0')}</div>
                </div>
              }
            >
              <Select
                data={InvoiceType}
                value={
                  // 0 表示开发票
                  +settlement?.china_vat_invoice?.invoice_type! &
                  ChinaVatInvoice_InvoiceType.VAT_SPECIAL
                    ? 0
                    : 1
                }
                onChange={(value: number) => {
                  const invoice_setting = value
                    ? `${ChinaVatInvoice_InvoiceType.UNSPECIFIED}`
                    : `${ChinaVatInvoice_InvoiceType.VAT_SPECIAL}`
                  setParentCustomer(
                    'settlement.china_vat_invoice.invoice_type',
                    invoice_setting,
                  )
                  setChildCustomer(
                    'settlement.china_vat_invoice.invoice_type',
                    invoice_setting,
                  )
                }}
              />
            </FormItem>
            <FormItem required label={t('白名单状态')}>
              <Switch
                type='primary'
                on={t('开启')}
                off={t('关闭')}
                checked={is_in_whitelist!}
                onChange={(e: boolean) => {
                  // 目前子父customer白名单状态保持一致
                  setParentCustomer('is_in_whitelist', e)
                  setChildCustomer('is_in_whitelist', e)
                }}
              />
            </FormItem>
          </FormBlock>
        </Form>
      </FormPanel>
    )
  }),
)

export default FinanceInfo
