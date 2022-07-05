import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  MoreSelect,
} from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'

import store from '../store'

const Filter: FC = observer(() => {
  const {
    filter: { service_period_id, quotation_id },
    quotationList,
    listServicePeriod,
    fetchServicePeriod,
    fetchQuotation,
    createInvitationCode,
    fetchInvitationCodeList,
  } = store

  useEffect(() => {
    fetchInvitationCodeList()
    fetchServicePeriod()
    fetchQuotation()
  }, [])

  const handleSelectChange = (
    value: number | any[] | string,
    key: string,
  ): void => {
    store.updateFilter(value, key)
  }

  const handleCreate = () => {
    createInvitationCode()
  }

  const handleMoreSelect = (select: MoreSelectDataItem, key: string) => {
    store.updateFilter(select, key)
  }

  return (
    <>
      <BoxForm labelWidth='62px' onSubmit={handleCreate}>
        <FormBlock col={3}>
          <FormItem label={t('运营时间')}>
            <Select
              data={listServicePeriod}
              value={service_period_id}
              onChange={(value) =>
                handleSelectChange(value, 'service_period_id')
              }
            />
          </FormItem>
          <FormItem label={t('报价单')}>
            <MoreSelect
              data={quotationList}
              selected={quotation_id}
              onSelect={(select: MoreSelectDataItem) =>
                handleMoreSelect(select, 'quotation_id')
              }
            />
          </FormItem>
          {/* <FormItem label={t('邀请码')}>
            <Select
              data={[]}
              value={group_id}
              onChange={(value) => handleSelectChange(value, 'group_id')}
            />
          </FormItem> */}
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('生成邀请码')}
          </Button>
        </FormButton>
      </BoxForm>
    </>
  )
})

export default Filter
