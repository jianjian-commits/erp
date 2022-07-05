import React, { MutableRefObject, useState } from 'react'
import { t } from 'gm-i18n'
import { FilterBar } from '@/common/components'
import moment from 'moment'
import DateRangeFilter from '@/common/components/date_range_filter'
import {
  MoreSelect_Customer,
  Select_CustomerLabel,
} from 'gm_api/src/enterprise/pc'
import { Customer, Customer_Type } from 'gm_api/src/enterprise'
import { FormInstance } from '@gm-pc/react/src/common/hooks'
import _ from 'lodash'

export const DATE_RANGE_TYPE = {
  /** 按下单日期 */
  ORDER_DATE: 1,
  /** 按收货日期 */
  RECEIPT_DATE: 2,
  /** 按出库日期 */
  OUT_DATE: 3,
} as const

const DateRangeType = [
  { type: DATE_RANGE_TYPE.ORDER_DATE, name: t('按下单日期'), expand: false },
  { type: DATE_RANGE_TYPE.RECEIPT_DATE, name: t('按收货日期'), expand: false },
  { type: DATE_RANGE_TYPE.OUT_DATE, name: t('按出库日期'), expand: false },
]

export interface FilterParams {
  timeRange: {
    begin: Date
    end: Date
    dateType: typeof DATE_RANGE_TYPE[keyof typeof DATE_RANGE_TYPE]
  }
  /** 已选择的客户 */
  customers: { text: string; value: string; original: Customer }[]
  /** 客户标签 id */
  customeLabelId: string
}

export interface FilterProps {
  form?: MutableRefObject<FormInstance<FilterParams>>
  defaultValue?: Partial<FilterParams>
  onSubmit?: (params: Partial<FilterParams>) => void
}

const Filter: React.VFC<FilterProps> = (props) => {
  const { form, defaultValue, onSubmit } = props

  const [initialValue] = useState<Partial<FilterParams>>(() => {
    if (_.isPlainObject(defaultValue)) {
      return defaultValue as Partial<FilterParams>
    }
    return {
      timeRange: {
        begin: moment().startOf('day').add(-29, 'day').toDate(),
        end: moment().endOf('day').toDate(),
        dateType: 1,
      },
    }
  })

  return (
    // @ts-expect-error  tabKey Prop 在此处没有作用
    <FilterBar<FilterParams>
      form={form}
      initialValues={initialValue}
      basicForms={[
        {
          name: 'timeRange',
          component: <DateRangeFilter data={DateRangeType} enabledTimeSelect />,
        },
        {
          label: t('客户筛选'),
          name: 'customers',
          valuePropName: 'selected',
          trigger: 'onSelect',
          component: (
            <MoreSelect_Customer
              multiple
              params={{
                paging: { limit: 999 },
                need_service_periods: true,
                level: 2,
                type: Customer_Type.TYPE_SOCIAL,
              }}
              renderListFilterType='pinyin'
              placeholder={t('全部客户')}
            />
          ),
        },
      ]}
      moreForms={[
        {
          label: t('客户标签'),
          name: 'customeLabelId',
          component: <Select_CustomerLabel all={{ value: '' }} />,
        },
      ]}
      onSubmit={onSubmit}
    />
  )
}

export default Filter
