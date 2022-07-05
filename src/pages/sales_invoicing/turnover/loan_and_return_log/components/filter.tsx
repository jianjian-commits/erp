import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  BoxFormMore,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import {
  TURNOVER_LEND_STATUS,
  TURNOVER_RETURN_STATUS,
} from '@/pages/sales_invoicing/enum'
import SelectFilter from './select_filter'
import { FtSheet } from '../../interface'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface Props {
  filter: FtSheet
  onChange: <T extends keyof FtSheet>(key: T, value: FtSheet[T]) => any
  handleSearch: () => any
  onExport: () => any
  tab: string
}

const Filter: FC<Props> = observer((props) => {
  const { handleSearch, onExport, onChange, filter, tab } = props
  const {
    begin_time,
    end_time,
    time_type,
    stock_sheet_status,
    customer_q,
    sku_q,
    select_type,
    warehouse_id,
  } = filter
  const isLend = tab === 'lend'
  const handleFilterChange = <T extends keyof FtSheet>(
    key: T,
    value: FtSheet[T],
  ) => {
    onChange(key, value)
  }
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      handleFilterChange('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  const handleExport = () => {
    onExport().then((json: any) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  const filterData = [
    {
      type: 1,
      name: '按建单时间',
      expand: false,
    },
    {
      type: 2,
      name: isLend ? '按借出时间' : '按归还时间',
      expand: false,
    },
  ]

  return (
    <BoxForm colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <FormItem>
          <DateRangeFilter
            data={filterData}
            value={{
              begin: begin_time,
              end: end_time,
              dateType: time_type,
            }}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        <FormBlock>
          {globalStore.isOpenMultWarehouse && (
            <FormItem label={t('仓库')} colWidth='250px'>
              <Select_WareHouse_Default
                value={warehouse_id}
                onChange={(value) => handleFilterChange('warehouse_id', value)}
              />
            </FormItem>
          )}
        </FormBlock>
        <FormItem>
          <SelectFilter
            select={select_type}
            input_value={{ customer_q, sku_q }}
            onChange={handleFilterChange}
          />
        </FormItem>
        <FormItem label={t('状态')} colWidth='250px'>
          <Select
            all={{ value: 0 }}
            value={stock_sheet_status}
            data={isLend ? TURNOVER_LEND_STATUS : TURNOVER_RETURN_STATUS}
            onChange={(value) =>
              handleFilterChange('stock_sheet_status', value)
            }
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
