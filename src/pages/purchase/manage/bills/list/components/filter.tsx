import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  ControlledFormItem,
  Select,
  FormButton,
  Input,
  Button,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import {
  TimeType,
  ExportPurchaseOrder,
  ExportPurchaseOrderType,
} from 'gm_api/src/purchase'
import { Observer } from 'mobx-react'
import store from '../store'

import type { F } from '../store'
import SupplierSelector from '../../../components/supplier_selector'
import {
  ORDER_STATE_ENUM,
  APP_TYPE_ENUM,
  ORDER_OP_ENUM,
  purchaseSheetState,
  purchaseSheetReceiptSource,
} from '../../../../enum'
import PurchasersSelector from '@/pages/purchase/manage/components/purchasers_selector'
import globalStore from '@/stores/global'
import { Group_BusinessType } from 'gm_api/src/enterprise'

const dateFilterData = [
  {
    type: 1,
    name: t('按建单时间'),
    expand: false,
  },

  {
    type: TimeType.RECEIVE_TIME,
    name: t('按预计到货时间'),
    expand: false,
  },
]

/**
 * @description 采购单据头部
 */

const Filter = (props: { onSearch: () => void }) => {
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.updateFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.updateFilter('begin', value.begin)
      store.updateFilter('end', value.end)
    }
  }

  const handleSearch = () => {
    props.onSearch()
  }

  const handleFilterChange = <T extends keyof F>(key: T, value: F[T]) => {
    store.updateFilter(key, value)
  }

  const handleMoreSelect = <T extends keyof F>(key: T, selected: any) => {
    store.updateFilter(key, selected)
  }

  const handleReset = () => {
    store.resetFilter()
  }

  /** @description 导出  */
  function handleExport() {
    const { filter } = store

    const state = ORDER_STATE_ENUM[filter.status]
    const order_op = ORDER_OP_ENUM[filter.source]
    const params = {
      serial_no: filter.q,
      supplier_ids: filter.suppliers.map((v) => v.value),
      purchaser_ids: filter.purchaser_ids.map((v) => v.value),
      state,
      begin_time: `${+filter.begin}`,
      end_time: `${+filter.end}`,
      order_op,
      time_type: filter.time_type,
      export_purchase_order_type:
        globalStore.userInfo?.group?.business_type! ===
        Group_BusinessType.STANDARD
          ? ExportPurchaseOrderType.PURCHASE_ORDER
          : ExportPurchaseOrderType.ERP_LITE_PURCHASE_ORDER,
      app_type: APP_TYPE_ENUM[filter.source],
    }

    ExportPurchaseOrder(params).then(() => {
      globalStore.showTaskPanel()
    })
  }

  return (
    <BoxForm onSubmit={handleSearch} labelWidth='100px' colWidth='385px'>
      <FormBlock col={3}>
        <Observer>
          {() => {
            return (
              <DateRangeFilter
                data={dateFilterData}
                value={{
                  begin: store.filter.begin,
                  end: store.filter.end,
                  dateType: store.filter.time_type,
                }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <ControlledFormItem label={t('搜索')}>
          <Observer>
            {() => {
              return (
                <Input
                  value={store.filter.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  placeholder={t('输入采购单据号')}
                />
              )
            }}
          </Observer>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <ControlledFormItem label={t('单据状态')}>
            <Observer>
              {() => (
                <Select
                  value={store.filter.status}
                  data={purchaseSheetState}
                  onChange={(v) => handleFilterChange('status', v as number)}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('供应商')}>
            <Observer>
              {() => (
                <SupplierSelector
                  selected={store.filter.suppliers}
                  onSelect={handleMoreSelect.bind(null, 'suppliers')}
                />
              )}
            </Observer>
          </ControlledFormItem>
          {!globalStore.isLite && (
            <ControlledFormItem label={t('单据来源')}>
              <Observer>
                {() => (
                  <Select
                    value={store.filter.source}
                    data={purchaseSheetReceiptSource}
                    onChange={(v) => handleFilterChange('source', v as number)}
                  />
                )}
              </Observer>
            </ControlledFormItem>
          )}
        </FormBlock>
        {!globalStore.isLite && (
          <ControlledFormItem label={t('采购员')}>
            <Observer>
              {() => (
                <PurchasersSelector
                  selected={store.filter.purchaser_ids}
                  onSelect={handleMoreSelect.bind(null, 'purchaser_ids')}
                />
              )}
            </Observer>
          </ControlledFormItem>
        )}
      </BoxFormMore>
      <FormButton>
        <Button htmlType='submit' type='primary'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <>
            <div className='gm-gap-10' />
            <Button onClick={handleReset}>{t('重置')}</Button>
          </>
        </BoxFormMore>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
}

export default Filter
