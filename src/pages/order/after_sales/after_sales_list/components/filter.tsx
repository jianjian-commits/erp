import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  MoreSelect,
  Select,
  Button,
  Flex,
  ControlledFormItem,
  ControlledForm,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { useGMLocation } from '@gm-common/router'
import SearchFilter from './search_filter'
import FilterButton from '@/common/components/filter_button'
import { ORDER_STATUS } from '../enum'
import store from '../store/list_store'
import { DataAddress } from '@gm-pc/business'
import globalStore from '@/stores/global'
import { Select_CustomerLabel } from 'gm_api/src/enterprise/pc'
import { TimeType } from 'gm_api/src/aftersale'

const dateFilterData = [
  {
    type: TimeType.TIME_TYPE_CREATE_AFTER_SALE,
    name: t('按建单时间'),
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_PLACE_ORDER,
    name: t('按下单时间'),
    expand: false,
  },
  {
    type: TimeType.TIME_TYPE_RECEIVE_GOODS,
    name: t('按收货时间'),
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
      quotation_id,
      city_id,
      district_id,
      street_id,
      driver_id,
      order_state,
      customer_label_id,
    },
    driverList,
    quotationList,
  } = store
  const { onSearch } = props
  const location = useGMLocation<{ order_serial_no?: string }>()
  const { order_serial_no } = location.query
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      store.changeFilter('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      store.changeFilter('begin_time', value.begin)
      store.changeFilter('end_time', value.end)
    }
  }

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  useEffect(() => {
    store.fetchQuotationList()
    store.fetchDriverList()
    if (order_serial_no) {
      store.changeFilter('order_serial_no', order_serial_no)
    }
  }, [])

  return (
    <BoxForm
      labelWidth='100px'
      colWidth='385px'
      // inline
      onSubmit={onSearch}
    >
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{ begin: begin_time, end: end_time, dateType: time_type }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        <ControlledFormItem>
          <Observer>
            {() => {
              const {
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
                    customer_user_name: customer_user_name || '',
                    customer_name: customer_name || '',
                  }}
                  onChange={(key, value) => {
                    store.changeFilter(key, value)
                  }}
                />
              )
            }}
          </Observer>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          {/* <ControlledFormItem label={t('报价单')} hide={globalStore.isLite}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              placeholder={t('全部报价单')}
              data={quotationList}
              selected={quotation_id}
              onSelect={(selected: any) => {
                store.changeFilter('quotation_id', selected)
              }}
            />
          </ControlledFormItem> */}
          <ControlledFormItem label={t('地理标签')} hide={globalStore.isLite}>
            {globalStore.stationInfo.attrs?.available_city_ids && (
              <DataAddress
                city_ids={globalStore.stationInfo.attrs?.available_city_ids!}
                selected={{ city_id, district_id, street_id }}
                placeholder={t('选择地理标签')}
                onSelect={(selected) => {
                  store.changeFilter('city_id', selected.city_id)
                  store.changeFilter('district_id', selected.district_id)
                  store.changeFilter('street_id', selected.street_id)
                }}
              />
            )}
          </ControlledFormItem>
          <ControlledFormItem label={t('订单状态')}>
            <Select
              value={order_state}
              data={
                globalStore.isLite
                  ? [
                      { value: 0, text: t('全部状态') },
                      { value: 1, text: t('未出库') },
                      { value: 3, text: t('已出库') },
                    ]
                  : ORDER_STATUS
              }
              onChange={(value) => {
                store.changeFilter('order_state', value)
              }}
            />
          </ControlledFormItem>
        </FormBlock>
        <FormBlock col={3}>
          {/* <ControlledFormItem label={t('司机筛选')} hide={globalStore.isLite}>
            <MoreSelect
              multiple
              renderListFilterType='pinyin'
              placeholder={t('全部司机')}
              data={driverList}
              selected={driver_id!}
              onSelect={(selected: any) => {
                store.changeFilter('driver_id', selected)
              }}
            />
          </ControlledFormItem> */}
          <ControlledFormItem label={t('商户标签')} hide={globalStore.isLite}>
            <Select_CustomerLabel
              all={{ value: '', text: t('全部') }}
              value={customer_label_id}
              onChange={(value: string) => {
                store.changeFilter('customer_label_id', value)
              }}
            />
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <Flex justifyStart>
        <FilterButton onExport={handleExport} />
        <Button
          className='gm-margin-left-10'
          onClick={() => store.reSetFilter()}
        >
          {t('重置')}
        </Button>
      </Flex>
    </BoxForm>
  )
})

export default Filter
