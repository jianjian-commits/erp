import { t } from 'gm-i18n'
import React, { FC, useRef, useEffect, ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import {
  FormGroup,
  FormPanel,
  Form,
  FormBlock,
  FormItem,
  Input,
  Validator,
  MoreSelect,
  Select,
  Flex,
} from '@gm-pc/react'
import { history } from '@/common/service'
import _ from 'lodash'
import { rulesetTypes } from '../../../enum'
import CustomerTable from './customer_table'
import SsuTable from './ssu_table'

const Detail: FC = observer(() => {
  const refform1 = useRef(null)
  // todo id
  const id = 'R111'
  const {
    detail: {
      state,
      create_time,
      quotation_id,
      quotation_name,
      rule_set_display_id,
      rule_set_id,
      rule_set_name,
      service_period_ids,
    },
    quotationList,
    serviceTimeList,
  } = store

  const quotation = _.find(
    quotationList,
    (q) => q.quotation_id === quotation_id,
  )

  useEffect(() => {
    if (id) {
      store.getDetail(id)
    }
  }, [])

  const handleSubmit = (): void => {}

  const handleCancel = (): void => {
    history.push('/merchandise/quotation/price')
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    store.changeRule(name, value)
  }

  const handleSelect = (name: string, value: any): void => {
    store.changeRule(name, value)
  }

  return (
    <FormGroup
      formRefs={[refform1]}
      onSubmitValidated={handleSubmit}
      onCancel={handleCancel}
    >
      <FormPanel title={t('基础信息')}>
        <Form
          ref={refform1}
          colWidth='400px'
          labelWidth='170px'
          hasButtonInGroup
        >
          <FormBlock col={2}>
            <FormItem label={t('协议单ID')}>
              <div className='gm-margin-top-5'>
                {rule_set_display_id || '-'}
              </div>
            </FormItem>
            <FormItem
              label={t('协议单ID')}
              required
              validate={Validator.create([], rule_set_name)}
            >
              <Input
                name='rule_set_name'
                type='text'
                onChange={handleInputChange}
                value={rule_set_name}
              />
            </FormItem>
          </FormBlock>
          <FormBlock col={2}>
            <FormItem
              label={t('关联报价单')}
              required
              validate={Validator.create([], quotation_id)}
            >
              <MoreSelect
                data={quotationList.slice()}
                selected={quotation}
                onSelect={(value) => handleSelect('quotation_id', value)}
              />
            </FormItem>
            <FormItem
              label={t('生效运营时间')}
              required
              validate={Validator.create([], service_period_ids.length)}
            >
              <MoreSelect
                multiple
                data={serviceTimeList.slice()}
                selected={service_period_ids}
                onSelect={(value) => handleSelect('service_period_ids', value)}
              />
            </FormItem>
          </FormBlock>
          <FormItem label={t('状态')} required>
            <Select
              data={rulesetTypes}
              value={state}
              onChange={(value) => handleSelect('state', value)}
            />
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('协议价信息')}>
        <Flex>
          <Flex flex={2}>
            <CustomerTable />
          </Flex>
          <Flex flex={3}>
            <SsuTable />
          </Flex>
        </Flex>
      </FormPanel>
    </FormGroup>
  )
})

export default Detail
