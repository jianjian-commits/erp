import DateRangeFilter from '@/common/components/date_range_filter'
import { dateFilterData } from '@/common/enum'
import BusinessType from '@/pages/financial_manage/settlement_manage/customer_settlement/components/filter_components/business_type'
import {
  abolishedPayStatus,
  datePickerTypes,
} from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'
import AppFilter from '@/pages/order/order_manage/list/components/app_filter'
import CustomerFilter from '@/pages/order/order_manage/list/components/customer_filter'
import OrderTypeFilter from '@/pages/order/order_manage/list/components/order_type_filter'
import PayStateFilter from '@/pages/order/order_manage/list/components/pay_state_filter'
import SearchFilter from '@/pages/order/order_manage/list/components/search_filter'
import StateFilter from '@/pages/order/order_manage/list/components/state_filter'
import globalStore from '@/stores/global'
import {
  BoxForm,
  BoxFormMore,
  Button,
  ControlledFormItem,
  FormBlock,
  FormButton,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import { list_BillOrder_PayAndAfterState } from 'gm_api/src/finance'
import _, { noop } from 'lodash'
import { Observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'
import store from '../store'

const Filter = () => {
  function handleReset() {
    store.init()
  }

  function handleDateChange(value: {
    begin?: Date
    end?: Date
    dateType?: number
  }): void {
    if (value.dateType) {
      store.updateFilter('dateType', value.dateType)
    }
    if (value.begin && value.end) {
      store.updateFilter('begin', value.begin)
      store.updateFilter('end', value.end)
    }
  }

  function handleSearch() {
    store.updateSelectedRowKeys([])
    store.updateSelected([])
    store.fetchList(true)
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <Observer>
          {() => {
            const { begin, end, dateType } = store.filter
            return (
              <DateRangeFilter
                data={datePickerTypes}
                value={{ begin, end, dateType }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <ControlledFormItem label={t('????????????')}>
          <Observer>
            {() => (
              <CustomerFilter
                value={store.filter.receive_customer_ids}
                onChange={(v) => store.updateFilter('receive_customer_ids', v)}
                extraParams={{ level: 2 }}
                placeholder={t('????????????')}
              />
            )}
          </Observer>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <ControlledFormItem>
            <Observer>
              {() => (
                <SearchFilter
                  value={{
                    serial_no: store.filter.serial_no,
                    receive_customer_id: '',
                  }}
                  onChange={store.updateFilter}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')}>
            <Observer>
              {() => (
                <BusinessType
                  value={store.filter.type}
                  onChange={(v) => store.updateFilter('type', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')}>
            <Observer>
              {() => (
                <StateFilter
                  value={store.filter.state}
                  onChange={(v) => store.updateFilter('state', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <AppFilter
                  value={store.filter.resource}
                  onChange={(v) => {
                    store.updateFilter('resource', v)
                  }}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <OrderTypeFilter
                  value={store.filter.customize_type_ids}
                  onChange={(v) => store.updateFilter('customize_type_ids', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')}>
            <Observer>
              {() => (
                <Select
                  data={[
                    { value: 0, text: t('????????????') },
                    ...list_BillOrder_PayAndAfterState.filter(
                      (item) => !abolishedPayStatus.includes(item.value),
                    ),
                  ]}
                  value={store.filter.pay_after_state}
                  onChange={(v) => store.updateFilter('pay_after_state', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('????????????')} hide={globalStore.isLite}>
            <Observer>
              {() => (
                <Select
                  all
                  data={[
                    { value: Filters_Bool.FALSE, text: t('?????????') },
                    { value: Filters_Bool.TRUE, text: t('?????????') },
                  ]}
                  value={store.filter.is_scan_receipt}
                  onChange={(v) => store.updateFilter('is_scan_receipt', v)}
                />
              )}
            </Observer>
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('??????')}
        </Button>
        <BoxFormMore>
          <>
            <Button onClick={handleReset} className='gm-margin-left-10'>
              {t('??????')}
            </Button>
          </>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default Filter
