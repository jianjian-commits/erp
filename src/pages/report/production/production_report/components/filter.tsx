import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { F } from '@/pages/report/production/base.store'
import { dateFilterData } from '@/pages/report/production/pack_report/components/filter'
import globalStore from '@/stores/global'
import {
  BoxForm,
  BoxFormMore,
  Button,
  Flex,
  FormBlock,
  FormButton,
  FormItem,
  Input,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { TaskDataFilter, Task_Type } from 'gm_api/src/production'
import { Observer, observer } from 'mobx-react'
import React, { ChangeEvent, FC } from 'react'
import store from '../store'

interface Props {
  onSearch: () => Promise<any>
}

const handleExport = (type: Task_Type) => {
  store
    .exportTaskData({
      type,
      task_data_filter: store.filter.searchTarget,
      clean_food_task_data_fields: store.view,
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
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={() => onSearch()}>
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
        <FormItem>
          <Flex>
            <div className='gm-padding-right-5' style={{ minWidth: '100px' }}>
              <Select
                className='gm-block'
                clean
                data={[
                  {
                    text: '生产成品',
                    value: TaskDataFilter.TASKDATAFILTER_PRODUCT,
                  },
                  {
                    text: '生产原料',
                    value: TaskDataFilter.TASKDATAFILTER_MATERIAL,
                  },
                ]}
                value={store.filter.searchTarget}
                onChange={(value) => store.updateFilter('searchTarget', value)}
              />
            </div>
            <Flex flex>
              <Input
                value={store.filter.q}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange('q', e.target.value)
                }
                placeholder={t('输入名称/编码')}
              />
            </Flex>
          </Flex>
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
          Permission.PERMISSION_REPORT_EXPORT_PRODUCTION_REPORT,
        ) && (
          <Button onClick={() => handleExport(store.tab)}>{t('导出')}</Button>
        )}
      </FormButton>
    </BoxForm>
  )
})

export default Filter
