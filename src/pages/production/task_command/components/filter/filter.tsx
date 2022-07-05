import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
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
import { Cascader } from 'antd'
import { t } from 'gm-i18n'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import {
  ExportProcessTask,
  list_ProcessTask_State,
  ProduceType,
} from 'gm_api/src/production'
import { MoreSelect_ProcessTemplate } from 'gm_api/src/production/pc'
import { Observer, observer } from 'mobx-react'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import React, { FC, useState } from 'react'
import { taskCommandDate } from '../../../util'
import type { FilterType } from '../../interface'
import store from '../../store'
import SearchFilter from './search_filter'

interface Props {
  onSearch: () => void
  type?: ProduceType
}

const Filter: FC<Props> = ({ type, onSearch }) => {
  const isPack = type === ProduceType.PRODUCE_TYPE_PACK
  const [cascadedKey, setCascadedKey] = useState(0)
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      state,
      target_customer_id,
      target_route_id,
      process_template_id,
      serial_no,
      input_sku_id,
      output_sku_id,
    },
    factoryModalList,
  } = store

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
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

  const handleInit = () => {
    store.resetFilter()
    setCascadedKey((v) => v + 1)
  }
  const handleExport = () => {
    ExportProcessTask({ filter: store.getSearchTaskData(type) }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <BoxForm labelWidth='100px' colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem>
          <DateRangeFilter
            data={taskCommandDate}
            value={{
              begin: begin_time,
              end: end_time,
              dateType: time_type!,
            }}
            onChange={handleDateChange}
            enabledTimeSelect
          />
        </FormItem>
        <FormItem>
          <SearchFilter
            value={{
              serial_no: serial_no!,
              input_sku_id: input_sku_id!,
              output_sku_id: output_sku_id!,
            }}
            type={type}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('车间筛选')}>
            <Cascader
              key={cascadedKey}
              style={{ width: '100%' }}
              multiple
              options={factoryModalList}
              placeholder={t('全部')}
              onChange={(value: SingleValueType[]) => {
                handleFilterChange('processor_ids', value)
              }}
            />
          </FormItem>
          <FormItem label={t('任务状态')}>
            <Select
              all={{ value: 0 }}
              data={list_ProcessTask_State}
              value={state}
              onChange={(value: number) => handleFilterChange('state', value)}
            />
          </FormItem>
          {/* <ControlledFormItem label={t('计划波次')}>
            <Observer>
              {() => {
                const { batch, begin_time, end_time, time_type, produce_type } =
                  store.filter
                return (
                  <BatchesSelector
                    begin_time={`${+begin_time}`}
                    end_time={`${+end_time}`}
                    time_type={time_type || 2}
                    produce_type={produce_type}
                    selected={batch}
                    onSelect={(selected) =>
                      handleFilterChange('batch', selected)
                    }
                  />
                )
              }}
            </Observer>
          </ControlledFormItem> */}
        </FormBlock>
        <FormBlock col={3}>
          {!isPack && (
            <FormItem label={t('工序筛选')}>
              <MoreSelect_ProcessTemplate
                selected={process_template_id}
                renderListFilterType='pinyin'
                onSelect={(value: MoreSelectDataItem<string>) => {
                  handleFilterChange('process_template_id', value)
                }}
                placeholder={t('全部')}
              />
            </FormItem>
          )}
          <FormItem label={t('客户筛选')}>
            <MoreSelect_Customer
              params={{ level: '1' }}
              selected={target_customer_id}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>) =>
                handleFilterChange('target_customer_id', value)
              }
              getResponseData={(data) => {
                data.customers.unshift({
                  customer_id: '1',
                  name: t('无'),
                  type: 0,
                })
                return data.customers
              }}
              placeholder={t('全部')}
            />
          </FormItem>
          <FormItem label={t('线路筛选')}>
            <MoreSelect_Route
              selected={target_route_id}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>) =>
                handleFilterChange('target_route_id', value)
              }
              getResponseData={(data) => {
                data.routes.unshift({
                  route_id: '1',
                  route_name: t('无'),
                })
                return data.routes
              }}
              getName={(item) => item.route_name!}
              placeholder={t('全部')}
            />
          </FormItem>
        </FormBlock>
        <FormBlock col={3}>
          <ControlledFormItem
            label={`${
              type === ProduceType.PRODUCE_TYPE_PACK ? '包装' : '生产'
            }备注`}
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
          <Button className='gm-margin-left-10' onClick={handleInit}>
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
