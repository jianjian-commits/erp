import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  Select,
  ControlledFormItem,
  Input,
  FormBlock,
  BoxForm,
  MoreSelect,
  Button,
  FormButton,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import detailStore from '../../stores/detail_store'
import { StockSheet_SheetType, TimeType } from 'gm_api/src/inventory'
import { observer } from 'mobx-react'

type ModalRightFilerProps = {
  onSearch: () => {}
}

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_SUBMIT,
    name: '按入库时间',
    expand: false,
  },
]

export const Stock_Sheet_Type = [
  {
    text: '采购入库',
    value: StockSheet_SheetType.SHEET_TYPE_PURCHASE_IN,
    url: 'purchase/stock_in',
  },
  {
    text: '生产入库',
    value: StockSheet_SheetType.SHEET_TYPE_PRODUCT_IN,
    url: 'produce/produce_stock_in',
  },
  // {
  //   text: '退料入库',
  //   value: StockSheet_SheetType.SHEET_TYPE_MATERIAL_IN,
  //   url: 'produce/refund_stock_in',
  // },
  {
    text: '其他入库',
    value: StockSheet_SheetType.SHEET_TYPE_OTHER_IN,
    url: 'other_stock/stock_in',
  },
]

const ModalRightFiler: FC<ModalRightFilerProps> = observer(({ onSearch }) => {
  const {
    modalRightFilter: {
      q,
      begin_time,
      end_time,
      stock_sheet_type,
      time_type,
      supplier_ids,
    },
    supplierList,
    changeModalRightFilter,
  } = detailStore

  const handleDateChange: DRFOnChange = (value) => {
    const { begin, end, dateType } = value
    changeModalRightFilter('begin_time', begin)
    changeModalRightFilter('end_time', end)
    changeModalRightFilter('time_type', dateType)
  }

  return (
    <>
      <BoxForm labelWidth='100px' colWidth='385px' onSubmit={onSearch}>
        <FormBlock col={3}>
          <DateRangeFilter
            data={dateFilterData}
            value={{ begin: begin_time, end: end_time, dateType: time_type }}
            onChange={handleDateChange}
            enabledTimeSelect
          />
          <ControlledFormItem label={t('入库类型')} colWidth='210px'>
            <Select
              value={stock_sheet_type}
              data={Stock_Sheet_Type}
              onChange={(e) => {
                changeModalRightFilter('stock_sheet_type', e)
              }}
            />
          </ControlledFormItem>
          <ControlledFormItem label={t('供应商筛选')} colWidth='280px'>
            <MoreSelect
              placeholder={t('请选择供应商')}
              data={supplierList.slice()}
              selected={supplier_ids}
              onSelect={(selected) => {
                changeModalRightFilter('supplier_ids', selected)
              }}
              renderListFilterType='pinyin'
              className='gm-margin-right-10'
            />
          </ControlledFormItem>
          <ControlledFormItem
            label={t('单据搜索')}
            colWidth='280px'
            className='gm-margin-top-10'
          >
            <Input
              value={q}
              onChange={(e) => {
                changeModalRightFilter('q', e.target.value)
              }}
              placeholder={t('请输入入库单号')}
            />
          </ControlledFormItem>
          <ControlledFormItem colWidth='280px' className='gm-margin-top-10'>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {t('搜索')}
              </Button>
            </FormButton>
          </ControlledFormItem>
        </FormBlock>
      </BoxForm>
    </>
  )
})

export default ModalRightFiler
