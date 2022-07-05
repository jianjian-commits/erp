import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  Input,
  DateRangePicker,
} from '@gm-pc/react'
import { Quotation_Status } from 'gm_api/src/merchandise'

import store from '../store'
import SupplierSelector from '../../../components/supplier_selector'

interface FilterProps {
  onSearch: () => Promise<any>
}

const statusesSelectData = [
  {
    text: '全部状态',
    value: 0,
  },
  {
    text: '未生效',
    value: Quotation_Status.STATUS_WAIT_VALID,
  },
  {
    text: '生效中',
    value: Quotation_Status.STATUS_VALID,
  },
  {
    text: '已失效',
    value: Quotation_Status.STATUS_INVALID,
  },
  {
    text: '已终止',
    value: Quotation_Status.STATUS_STOP,
  },
]

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  useEffect(() => {
    onSearch && onSearch()
  }, [])

  const {
    filter: { start_time, end_time, quotation_q, quotation_status, supplier },
  } = store

  return (
    <BoxForm labelWidth='74px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按建单时间')}>
          <DateRangePicker
            begin={start_time ? new Date(+start_time) : undefined}
            end={end_time ? new Date(+end_time) : undefined}
            enabledTimeSelect
            onChange={(begin: Date, end: Date) => {
              if (begin && end) {
                store.updateFilter('start_time', `${+begin}`)
                store.updateFilter('end_time', `${+end}`)
              }
            }}
          />
        </FormItem>
        <FormItem label={t('搜索')}>
          <Input
            value={quotation_q}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              store.updateFilter('quotation_q', e.target.value)
            }
            type='text'
            maxLength={30}
            placeholder={t('输入协议单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={2}>
          <FormItem label={t('单据状态')}>
            <Select
              value={quotation_status}
              onChange={(value) =>
                store.updateFilter('quotation_status', value)
              }
              data={statusesSelectData}
            />
          </FormItem>
          <FormItem label={t('供应商')}>
            <SupplierSelector
              selected={supplier}
              onSelect={(value) => {
                store.updateFilter('supplier', value)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        {/* <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button> */}
        <Button type='primary' onClick={() => onSearch()}>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <Button
            onClick={() => store.resetData()}
            className='gm-margin-left-10'
          >
            {t('重置')}
          </Button>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
