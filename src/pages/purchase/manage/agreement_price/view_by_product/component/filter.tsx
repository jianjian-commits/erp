import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  ControlledFormItem,
  FormButton,
  Button,
  Select,
  Input,
  DateRangePicker,
} from '@gm-pc/react'
import { Quotation_Status } from 'gm_api/src/merchandise'
// import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import CategoryFilter from '@/common/components/category_filter'
import store from '../store'
import SupplierSelector from '@/pages/purchase/manage/components/supplier_selector'
import globalStore from '@/stores/global'

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
    filter: {
      start_time,
      end_time,
      q,
      quotation_type,
      category,
      supplier,
      quotation_status,
    },
  } = store

  const handleExport = (): void => {
    store.exportPriceList().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  return (
    <BoxForm labelWidth='74px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <ControlledFormItem label={t('日期筛选')}>
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
        </ControlledFormItem>
        <ControlledFormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              store.updateFilter('q', e.target.value)
            }
            type='text'
            maxLength={30}
            placeholder={t('输入自定义编码或者商品名')}
          />
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <ControlledFormItem col={1} label={t('商品筛选')}>
          {/* <CategoryPinleiFilter
            selected={category}
            onChange={(value) => {
              store.updateFilter('category', value)
            }}
          /> */}
          <Observer>
            {() => (
              <CategoryFilter
                style={{ width: '270px' }}
                multiple
                onChange={(value) => store.updateFilter('category', value)}
              />
            )}
          </Observer>
        </ControlledFormItem>
        <FormBlock col={2}>
          <ControlledFormItem label={t('状态筛选')}>
            <Select
              value={quotation_status}
              onChange={(value) =>
                store.updateFilter('quotation_status', value)
              }
              data={statusesSelectData}
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('供应商')}>
            <SupplierSelector
              selected={supplier}
              onSelect={(value) => {
                store.updateFilter('supplier', value)
              }}
            />
          </ControlledFormItem>
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
        <Button onClick={handleExport} className='gm-margin-left-10'>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
