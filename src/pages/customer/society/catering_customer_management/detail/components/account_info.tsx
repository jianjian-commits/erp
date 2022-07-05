import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useState, forwardRef } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  FormBlock,
  Button,
} from '@gm-pc/react'
import { CodeInput } from '@gm-pc/business'
import _ from 'lodash'
import { useGMLocation } from '@gm-common/router'
import globalStore from '@/stores/global'

interface AccountProps {
  store: any
}
const AccountInfo = observer(
  forwardRef<Form, AccountProps>(({ store }, ref) => {
    const location = useGMLocation<{ type: string }>()
    const { type } = location.query
    const [active, setActive] = useState(false)
    const {
      accountInfo: { customer_password, customer_password2 },
      parentCustomer: { customized_code, settlement },
      customerUser: { name },
      setParentCustomer,
      updateAccountInfoDetail,
      viewType,
      setCustomerUser,
    } = store
    const { china_vat_invoice } = settlement
    const accountInfoUpdate = (value: any, key: string) => {
      updateAccountInfoDetail(value, key)
    }
    return (
      <FormPanel title={t('账号信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormBlock col={2}>
            <FormItem required label={t('公司信息')}>
              <Input
                className='form-control'
                value={china_vat_invoice?.company_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setParentCustomer(
                    'settlement.china_vat_invoice.company_name',
                    e.target.value,
                  )
                  setParentCustomer('name', e.target.value)
                }}
                type='text'
                maxLength={30}
              />
            </FormItem>

            <FormItem required label={t('公司编码')}>
              <CodeInput
                name='customize_code'
                maxLength={30}
                value={customized_code}
                needTextChange={type === 'createParentCustomer'}
                text={china_vat_invoice?.company_name}
                onChange={(value: string) => {
                  setParentCustomer('customized_code', value)
                }}
              />
            </FormItem>
          </FormBlock>
          {type === 'createParentCustomer' ? (
            !globalStore.isLite && (
              <FormBlock col={2}>
                <FormItem required label={t('登录账号')}>
                  <Input
                    autoComplete='off'
                    className='form-control'
                    value={name || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setCustomerUser('name', e.target.value)
                      accountInfoUpdate(e.target.value, 'customer_account')
                    }}
                    placeholder={t('请输入账号')}
                    type='text'
                    maxLength={30}
                  />
                </FormItem>

                <FormItem required label={t('登录密码')}>
                  <Input
                    autoComplete='new-password'
                    className='form-control'
                    value={customer_password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      accountInfoUpdate(e.target.value, 'customer_password')
                      accountInfoUpdate(e.target.value, 'customer_password2')
                    }}
                    placeholder={t('请输入密码')}
                    type='password'
                    maxLength={30}
                  />
                </FormItem>
              </FormBlock>
            )
          ) : (
            <FormBlock col={2}>
              <FormItem required label={t('账户类型')}>
                <span className='b-form-item-value'>{t('餐饮客户')}</span>
              </FormItem>

              {!globalStore.isLite && (
                <>
                  <FormItem required label={t('登录账号')}>
                    <span className='b-form-item-value'>{name || ''}</span>
                  </FormItem>

                  <FormItem required label={t('登录密码')}>
                    {active ? (
                      <>
                        <Input
                          className='form-control'
                          value={customer_password}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            accountInfoUpdate(
                              e.target.value,
                              'customer_password',
                            )
                          }
                          placeholder={t('请输入密码')}
                          type='password'
                          maxLength={30}
                        />
                        <Input
                          className='form-control gm-margin-top-10'
                          value={customer_password2}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            accountInfoUpdate(
                              e.target.value,
                              'customer_password2',
                            )
                          }
                          placeholder={t('请再次输入密码')}
                          type='password'
                          maxLength={30}
                        />
                      </>
                    ) : (
                      <Button type='link' onClick={() => setActive(true)}>
                        {t('修改密码')}
                      </Button>
                    )}
                  </FormItem>
                </>
              )}
            </FormBlock>
          )}
        </Form>
      </FormPanel>
    )
  }),
)

export default AccountInfo
