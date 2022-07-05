import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import globalStore from '@/stores/global'
import {
  BoxForm,
  BoxFormMore,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  Input,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { TaskDataFilter, Task_TimeType, Task_Type } from 'gm_api/src/production'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import React, { ChangeEvent, FC } from 'react'
import type { F } from '../../base.store'
import store from '../store'

interface Props {
  onSearch: () => Promise<any>
}

const limit = (date: Date, v: { begin?: Date; end?: Date }) => {
  return !(
    moment(date).isSameOrAfter(moment(v.begin).add(-3, 'month')) &&
    moment(date).isSameOrBefore(moment())
  )
}

// 暂时限制查询三个月
const disabledDate = (date: Date, v: { begin?: Date; end?: Date }) => {
  if (v.begin && !v.end) {
    if (
      moment(date).isSameOrAfter(moment(v.begin).add(-3, 'month')) &&
      moment(date).isSameOrBefore(moment(v.begin).add(3, 'month'))
    ) {
      return false
    }
    return true
  }
  return false
}

export const dateFilterData = [
  {
    type: Task_TimeType.TIME_TYPE_CREATE,
    name: t('按创建时间'),
    expand: false,
    limit,
  },
  {
    type: Task_TimeType.TIME_TYPE_DELIVERY,
    name: t('按计划交期'),
    expand: false,
    limit: disabledDate,
  },
  {
    type: Task_TimeType.TIME_TYPE_RELEASE,
    name: t('按下达时间'),
    expand: false,
    limit,
  },
]

const handleExport = (type: Task_Type) => {
  store
    .exportTaskData({
      type,
      task_data_filter: TaskDataFilter.TASKDATAFILTER_PRODUCT,
    })
    .then(() => {
      globalStore.showTaskPanel()
    })
}

const handleFilterChange = <T extends keyof F>(key: T, value: F[T]) => {
  store.updateFilter(key, value)
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

const Filter: FC<Props> = observer(({ onSearch }) => {
  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <Observer>
          {() => {
            const { begin_time, end_time, time_type } = store.filter
            return (
              <DateRangeFilter
                data={dateFilterData}
                value={{
                  begin: begin_time,
                  end: end_time,
                  dateType: time_type,
                }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <FormItem label={t('搜索')}>
          <Observer>
            {() => {
              const { q } = store.filter
              return (
                <Input
                  value={q}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange('q', e.target.value)
                  }
                  placeholder={t('输入名称/编码')}
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('商品筛选')} col={2}>
            <Observer>
              {() => (
                <CategoryPinleiFilter
                  selected={store.filter.category}
                  onChange={(value) =>
                    handleFilterChange('category', {
                      ...store.filter.category,
                      ...value,
                    })
                  }
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('商品类型')}>
            <Observer>
              {() => {
                const { sku_type } = store.filter
                return (
                  <Select
                    all
                    data={list_Sku_NotPackageSubSkuType}
                    value={sku_type}
                    onChange={(value) => handleFilterChange('sku_type', value)}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit' className='gm-margin-right-5'>
          {t('搜索')}
        </Button>
        {globalStore.hasPermission(
          Permission.PERMISSION_REPORT_EXPORT_PACKAGING_REPORT,
        ) && (
          <Button onClick={() => handleExport(Task_Type.TYPE_PACK)}>
            {t('导出')}
          </Button>
        )}
      </FormButton>
    </BoxForm>
  )
})

export default Filter
