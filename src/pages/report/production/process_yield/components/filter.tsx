import CategoryPinleiFilter from '@/common/components/category_filter_hoc'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import { F } from '@/pages/report/production/base.store'
import { dateFilterData } from '@/pages/report/production/pack_report/components/filter'
import globalStore from '@/stores/global'
import { useGMLocation } from '@gm-common/router'
import {
  BoxForm,
  BoxFormMore,
  Button,
  Confirm,
  FormBlock,
  FormButton,
  FormItem,
  Input,
  Radio,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { TaskDataFilter, Task_Type } from 'gm_api/src/production'
import { runInAction } from 'mobx'
import { Observer, observer } from 'mobx-react'
import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import store from '../store'

interface Props {
  onSearch: () => Promise<any>
}

const handleExport = async (type: Task_Type) => {
  let _onlyOne = true
  const Template = () => {
    const [onlyOne, setOnlyOne] = useState(_onlyOne)
    _onlyOne = onlyOne
    return (
      <div>
        <div className='gm-margin-bottom-10'>选择导出的数据范围</div>
        <div className='gm-margin-bottom-10'>
          <Radio checked={onlyOne} onChange={() => setOnlyOne(true)}>
            仅导出当前页面商品
          </Radio>
        </div>
        <div className='gm-margin-bottom-10'>
          <Radio checked={!onlyOne} onChange={() => setOnlyOne(false)}>
            导出筛选时间下全部商品
          </Radio>
        </div>
      </div>
    )
  }
  await Confirm({
    children: <Template />,
  })
  store
    .exportTaskData({
      type,
      task_data_filter: TaskDataFilter.TASKDATAFILTER_PRODUCT,
      onlyOne: _onlyOne,
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
  const location = useGMLocation<{
    q: string
    time_type: string
    begin_time: string
    end_time: string
  }>()
  useEffect(() => {
    if (!location.query.q) return
    runInAction(() => {
      store.filter.q = location.query.q
      store.filter.time_type = +location.query.time_type
      store.filter.begin_time = new Date(+location.query.begin_time)
      store.filter.end_time = new Date(+location.query.end_time)
    })
    onSearch()
  }, [location.query.q])

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
          Permission.PERMISSION_REPORT_DERIVED_YIELD,
        ) && (
          <Button
            onClick={() => handleExport(Task_Type.TYPE_PRODUCE_CLEANFOOD)}
          >
            {t('导出')}
          </Button>
        )}
      </FormButton>
    </BoxForm>
  )
})

export default Filter
