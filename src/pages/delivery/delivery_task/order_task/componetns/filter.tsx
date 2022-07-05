import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  BoxFormMore,
  Select,
  MoreSelect,
} from '@gm-pc/react'
import { DataAddress } from '@gm-pc/business'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { PRINT_STATUS } from '../../enum'
import store from '../store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import globalStore from '@/stores/global'
import { MoreSelect_QuotationV2 } from '@/common/components'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import SearchFilter from './search_filter'
import { orderState } from '../../../util'
import MealTImeFilter from '../../../../order/order_manage/list/components/meal_time_filter'

interface FilterProps {
  onSearch: () => Promise<any>
}

const dateFilterData = [
  {
    type: 1,
    name: '按下单日期',
    expand: false,
  },
  {
    type: 2,
    name: '按收货日期',
    expand: false,
  },
]

const Filter: FC<FilterProps> = ({ onSearch }) => {
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      state,
      is_print,
      driver,
      route,
      quotation_ids,
      city_id,
      district_id,
      street_id,
    },
    driverList,
    fetchDriverList,
    fetchListDistributionContractor,
  } = store
  const handleSearch = () => {
    onSearch()
  }

  const handleFilterChange = (key: string, value: any) => {
    store.changeFilter(key, value)
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

  const handleMoreSelect = (
    select: MoreSelectDataItem<string>[],
    key: string,
  ) => {
    store.changeFilter(key, select)
  }

  const handleSelectChange = (
    value: number | any[] | string,
    key: string,
  ): void => {
    store.changeFilter(key, value)
  }
  useEffect(() => {
    onSearch && onSearch()
    fetchListDistributionContractor()
    fetchDriverList()
  }, [])

  const city_ids = globalStore.stationInfo.attrs?.available_city_ids

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{
            begin: begin_time,
            end: end_time,
            dateType: time_type,
          }}
          enabledTimeSelect
          onChange={handleDateChange}
        />
        <FormItem>
          <Observer>
            {() => (
              <SearchFilter
                value={{
                  serial_no: store.filter.serial_no,
                  customer_text: store.filter.customer_text,
                }}
                onChange={handleFilterChange}
              />
            )}
          </Observer>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('订单状态')}>
            <Select
              data={orderState}
              all={{ text: '全部状态', value: 0 }}
              value={state}
              onChange={(value: number) => handleSelectChange(value, 'state')}
            />
          </FormItem>
          <FormItem label={t('线路筛选')}>
            <MoreSelect_Route
              multiple
              selected={route}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleMoreSelect(value, 'route')
              }
              getName={(item) => item.route_name!}
            />
          </FormItem>
          <FormItem label={t('司机筛选')}>
            <MoreSelect
              multiple
              data={driverList}
              selected={driver}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleMoreSelect(value, 'driver')
              }
            />
          </FormItem>
          {!globalStore.isLite && (
            <FormItem label={t('地理标签')}>
              {city_ids && (
                <DataAddress
                  city_ids={city_ids}
                  selected={{ city_id, district_id, street_id }}
                  onSelect={(selected) => {
                    handleSelectChange(selected.city_id!, 'city_id')
                    handleSelectChange(selected.district_id!, 'district_id')
                    handleSelectChange(selected.street_id!, 'street_id')
                  }}
                />
              )}
            </FormItem>
          )}

          <FormItem label={t('打印状态')}>
            <Select
              onChange={(value) => handleFilterChange('is_print', value)}
              value={is_print}
              data={PRINT_STATUS}
            />
          </FormItem>
          {!globalStore.isLite && (
            <FormItem label={t('报价单/菜谱')}>
              <MoreSelect_QuotationV2
                multiple
                selected={quotation_ids}
                // eslint-disable-next-line react/jsx-handler-names
                onSelect={(select: MoreSelectDataItem<string>[]) =>
                  handleMoreSelect(select, 'quotation_ids')
                }
                renderListFilterType='pinyin'
                getName={(item) => item.inner_name!}
              />
            </FormItem>
          )}
          {!globalStore.isLite && (
            <FormItem label={t('餐次')}>
              <Observer>
                {() => (
                  <MealTImeFilter
                    value={store.filter.menu_period_group_ids}
                    onChange={(value) =>
                      handleFilterChange('menu_period_group_ids', value)
                    }
                  />
                )}
              </Observer>
            </FormItem>
          )}
          {/* <FormItem label={t('商户标签')}>
            <MoreSelect
              data={labelList}
              selected={label}
              onSelect={(select: MoreSelectDataItem) =>
                handleMoreSelect(select, 'label')
              }
              renderListFilterType='pinyin'
              placeholder={t('全部标签')}
            />
          </FormItem> */}
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button className='gm-margin-left-10' onClick={store.reset}>
          {t('重置')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
