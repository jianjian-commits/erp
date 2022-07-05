import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  FormItem,
  FormBlock,
  BoxForm,
  BoxFormMore,
  MoreSelect,
  MoreSelectDataItem,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'
import FilterButton from '@/common/components/filter_button'
import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import type { FilterOptions } from '../interface'
import { TimeType } from 'gm_api/src/aftersale'
import store from '../store'
import SearchFilter from './search_filter'
import globalStore from '@/stores/global'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE_AFTER_SALE,
    name: '按建单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_PLACE_ORDER,
    name: '按下单时间',
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_RECEIVE_GOODS,
    name: '按收货时间',
    expand: false,
  },
]

interface FilterProps {
  onSearch: () => Promise<any>
}
const Filter: FC<FilterProps> = observer((props) => {
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      category_ids,
      route_selected,
      driver_selected,
    },
    driverList,
  } = store
  const show_driverList = driverList

  const { onSearch } = props

  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.changeFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.changeFilter('begin_time', value.begin)
      store.changeFilter('end_time', value.end)
    }
  }

  const handleSelectChange = (field: string, value: any): void => {
    store.changeFilter(field as keyof FilterOptions, value)
  }

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  useEffect(() => {
    store.fetchDriverList()
  }, [])

  return (
    <BoxForm labelWidth='100px' colWidth='385px' inline onSubmit={onSearch}>
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{ begin: begin_time, end: end_time, dateType: time_type }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        <FormItem>
          <Observer>
            {() => {
              const {
                sku_name,
                ssu_customize_code,
                serial_no,
                order_serial_no,
                customer_user_name,
                customer_name,
              } = store.filter
              return (
                <SearchFilter
                  value={{
                    serial_no: serial_no || '',
                    order_serial_no: order_serial_no || '',
                    sku_name: sku_name || '',
                    ssu_customize_code: ssu_customize_code || '',
                    customer_user_name: customer_user_name || '',
                    customer_name: customer_name || '',
                  }}
                  onChange={(key, value) => {
                    handleSelectChange(key, value)
                  }}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={2}>
          <FormItem label={t('商品筛选')}>
            <CategoryPinleiFilter
              selected={category_ids}
              onChange={(value) => handleSelectChange('category_ids', value)}
              disablePinLei
            />
          </FormItem>
          <FormItem label={t('司机')}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              placeholder={t('全部司机')}
              data={show_driverList}
              selected={driver_selected}
              onSelect={(selected) => {
                handleSelectChange('driver_selected', selected)
              }}
            />
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          <FormItem label={t('线路')}>
            <MoreSelect_Route
              multiple
              selected={route_selected}
              placeholder={t('全部线路')}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleSelectChange('route_selected', value)
              }
              getName={(item) => item.route_name!}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FilterButton onExport={handleExport} />
    </BoxForm>
  )
})

export default Filter
