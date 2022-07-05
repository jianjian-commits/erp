import CustomerFilter from '@/pages/order/order_manage/list/components/customer_filter'
import {
  BoxForm,
  BoxFormMore,
  Button,
  ControlledFormItem,
  DateRangePicker,
  FormBlock,
  FormButton,
  Input,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import {
  list_SettleSheet_SettleStatus,
  list_SettleSheet_SheetStatus,
  map_SettleSheet_SettleStatus,
} from 'gm_api/src/finance'
import _, { noop } from 'lodash'
import { Observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'
import store from '../store'

const Filter = () => {
  function handleReset() {
    store.initFilter()
  }

  function handleDateChange(begin: Date, end: Date): void {
    if (begin && end) {
      store.updateFilter('begin', begin)
      store.updateFilter('end', end)
    }
  }

  function handleSearch() {
    store.fetchList(true)
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <ControlledFormItem label={t('结款日期')}>
          <Observer>
            {() => {
              const { begin, end } = store.filter
              return (
                <DateRangePicker
                  begin={begin}
                  end={end}
                  onChange={handleDateChange}
                  //   disabledDate={target?.limit}
                  //   enabledTimeSelect={enabledTimeSelect}
                />
              )
            }}
          </Observer>
        </ControlledFormItem>
        <ControlledFormItem label={t('按自定义凭证号')}>
          <Observer>
            {() => {
              const { customize_settle_voucher } = store.filter
              return (
                <Input
                  value={customize_settle_voucher}
                  onChange={(e) =>
                    store.updateFilter(
                      'customize_settle_voucher',
                      e.target.value,
                    )
                  }
                />
              )
            }}
          </Observer>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <ControlledFormItem label={t('公司筛选')}>
            <Observer>
              {() => (
                <CustomerFilter
                  value={store.filter.target_ids}
                  onChange={(v) => store.updateFilter('target_ids', v)}
                  extraParams={{ level: 1 }}
                  placeholder={t('全部公司')}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('凭证状态')}>
            <Observer>
              {() => (
                <Select
                  all
                  data={list_SettleSheet_SettleStatus}
                  value={store.filter.settle_status}
                  onChange={(v) => store.updateFilter('settle_status', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <>
            <Button onClick={handleReset} className='gm-margin-left-10'>
              {t('重置')}
            </Button>
          </>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default Filter
