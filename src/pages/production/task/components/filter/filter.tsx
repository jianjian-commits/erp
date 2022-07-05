import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { Task_Produce_Type_Enum } from '@/pages/production/enum'
import globalStore from '@/stores/global'
import {
  BoxForm,
  BoxFormMore,
  Button,
  ControlledFormItem,
  FormBlock,
  FormButton,
  FormItem,
  MoreSelectDataItem,
  Select,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { ExportTask, list_Task_State, Task_Type } from 'gm_api/src/production'
import { observer, Observer } from 'mobx-react'
import React, { FC } from 'react'
import { dateFilterData } from '../../../util'
import type { Filter as TaskFilter } from '../../interface'
import store from '../../store'
import SearchFilter from './search_filter'

interface Props {
  onSearch: () => Promise<any>
  type?: Task_Type
}

const Filter: FC<Props> = ({ onSearch, type }) => {
  const handleFilterChange = <T extends keyof TaskFilter>(
    key: T,
    value: TaskFilter[T],
  ) => {
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

  const handleReset = () => {
    store.resetFilter()
  }

  const handleExport = () => {
    const req = store.getSearchData(type)
    ExportTask({
      filter: {
        ...req,
        paging: { limit: 999 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

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
                  dateType: time_type || 2,
                }}
                onChange={handleDateChange}
                enabledTimeSelect
              />
            )
          }}
        </Observer>
        <FormItem>
          <Observer>
            {() => {
              const { q, serial_no } = store.filter
              return (
                <SearchFilter
                  value={{
                    serial_no: serial_no || '',
                    sku_name: q || '',
                  }}
                  onChange={(key, value) => handleFilterChange(key, value)}
                />
              )
            }}
          </Observer>
        </FormItem>
        {type !== Task_Type.TYPE_PACK && (
          <FormItem label={t('BOM类型')}>
            <Observer>
              {() => {
                const { task_type } = store.filter
                return (
                  <Select
                    value={task_type}
                    onChange={(value) => handleFilterChange('task_type', value)}
                    data={Task_Produce_Type_Enum}
                  />
                )
              }}
            </Observer>
          </FormItem>
        )}
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('分类')}>
            <Observer>
              {() => (
                <CategoryCascader
                  value={store.filter.category_ids}
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    handleFilterChange('category_ids', value as string[])
                  }
                />
              )}
            </Observer>
          </FormItem>
          <FormItem label={t('计划状态')}>
            <Observer>
              {() => {
                const { state } = store.filter
                return (
                  <Select
                    all
                    data={list_Task_State}
                    value={state}
                    onChange={(value) => handleFilterChange('state', value)}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <ControlledFormItem label={t('商品类型')}>
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
          </ControlledFormItem>
        </FormBlock>
        <FormBlock col={3}>
          {/* <FormItem label={t('计划来源')}>
            <Observer>
              {() => {
                const { source } = store.filter
                // 包装计划需要过滤掉预包装计划来源
                const data = _.map(list_Task_Source, (s) => {
                  if (s.value === Task_Source.SOURCE_PLAN) {
                    return {
                      ...s,
                      text:
                        type === Task_Type.TYPE_PACK
                          ? t('预包装计划')
                          : t('预生产计划'),
                    }
                  }
                  return { ...s }
                })

                return (
                  <Select
                    all
                    data={
                      type === Task_Type.TYPE_PACK
                        ? _.filter(
                            data,
                            (item) =>
                              item.value !== Task_Source.SOURCE_PACK_TASK,
                          )
                        : data
                    }
                    value={
                      type === Task_Type.TYPE_PACK
                        ? source === Task_Source.SOURCE_PACK_TASK
                          ? Task_Source.SOURCE_UNSPECIFIED
                          : source
                        : source
                    }
                    onChange={(value) => handleFilterChange('source', value)}
                  />
                )
              }}
            </Observer>
          </FormItem> */}
          {/* <FormItem label={t('计划波次')}>
            <Observer>
              {() => {
                const { batch, begin_time, end_time, time_type } = store.filter
                return (
                  <BatchesSelector
                    begin_time={`${+begin_time}`}
                    end_time={`${+end_time}`}
                    time_type={time_type || 2}
                    task_type={type}
                    selected={batch}
                    onSelect={(selected) =>
                      handleFilterChange('batch', selected)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem> */}
        </FormBlock>
        <FormBlock col={3}>
          {/* <FormItem label={t('工厂模型')}>
            <Observer>
              {() => {
                const { processor_selected } = store.filter
                return (
                  <MulFactoryModalSelector
                    selected={processor_selected.slice()}
                    onSelect={(value) =>
                      handleFilterChange('processor_selected', value)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem> */}
          <FormItem label={t('客户筛选')}>
            <Observer>
              {() => {
                const { user_selected } = store.filter
                return (
                  <MoreSelect_Customer
                    multiple
                    params={{ type: 2 }}
                    selected={user_selected}
                    renderListFilterType='pinyin'
                    onSelect={(value: MoreSelectDataItem<string>[]) =>
                      handleFilterChange('user_selected', value)
                    }
                    placeholder={t('全部')}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('线路筛选')}>
            <Observer>
              {() => {
                const { route } = store.filter
                return (
                  <MoreSelect_Route
                    multiple
                    selected={route}
                    renderListFilterType='pinyin'
                    onSelect={(value: MoreSelectDataItem<string>[]) =>
                      handleFilterChange('route', value)
                    }
                    getResponseData={(data) => {
                      data.routes.unshift({
                        route_id: '0',
                        route_name: t('无'),
                      })
                      return data.routes
                    }}
                    getName={(item) => item.route_name!}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          <ControlledFormItem
            label={`${type === Task_Type.TYPE_PACK ? '包装' : '生产'}备注`}
          >
            <Observer>
              {() => {
                const { batch } = store.filter
                return (
                  <TextArea
                    value={batch}
                    onChange={(e) => {
                      handleFilterChange('batch', e.target.value)
                    }}
                  />
                )
              }}
            </Observer>
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <Button className='gm-margin-left-10' onClick={handleReset}>
            {t('重置')}
          </Button>
        </BoxFormMore>
        <Button className='gm-margin-left-10' onClick={handleExport}>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
