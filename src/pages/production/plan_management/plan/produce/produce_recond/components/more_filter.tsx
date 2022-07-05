import {
  DateRangePicker,
  FormBlock,
  BoxForm,
  FormItem,
  Select as GmSelect,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useEffect, useState } from 'react'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { ListProcessor } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import { Cascader, Select } from 'antd'
import { skuTypeList } from '@/pages/production/plan_management/plan/produce/utils'

const MoreFilter: FC<{}> = () => {
  const { updateFilter, filter } = store
  const { begin_time, end_time, sku_type } = filter
  const [factoryModalList, setFactoryModalList] = useState<any[]>([])
  const fetchFactoryModalList = () => {
    return ListProcessor({ paging: { limit: 999 } }).then((json) => {
      const { processors } = json.response
      const group = _.groupBy(processors, 'parent_id')
      const parents = group['0']
      const list = (parents || []).map((v) => ({
        ...v,
        value: v.processor_id,
        text: v.name,
        label: v.name,
        children: group[v.processor_id]
          ? _.map(group[v.processor_id], (g) => ({
              ...g,
              value: g.processor_id,
              text: g.name,
              label: g.name,
            }))
          : undefined,
      }))
      setFactoryModalList(list)
      return null
    })
  }

  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      updateFilter('begin_time', begin_time)
      updateFilter('end_time', end_time)
    }
  }

  useEffect(() => {
    fetchFactoryModalList()
  }, [])

  return (
    <BoxForm labelWidth='120px' colWidth='385px'>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label='产出时间'>
          <DateRangePicker
            begin={begin_time!}
            end={end_time!}
            onChange={handleDateChange}
            enabledTimeSelect
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('分类')}>
          <CategoryCascader
            multiple
            style={{ width: '100%' }}
            value={store.categoryIds}
            onChange={(value) => {
              store.setCategoryIds(value)
              const ids = value.map((id: any) => id[id.length - 1])
              store.updateFilter('category_ids', ids)
            }}
            showAdd={false}
            maxTagCount={2}
            maxTagTextLength={5}
            allowClear={false}
          />
        </FormItem>
        <FormItem label={t('成品筛选')}>
          <Select
            style={{ width: '100%' }}
            placeholder={t('输入成品名称搜索')}
            mode='multiple'
            showSearch
            maxTagCount={2}
            maxTagTextLength={5}
            value={store.sku}
            options={store.skuList}
            filterOption={false}
            onSearch={_.debounce((q: string) => store.fetchSkuList(q), 500)}
            onChange={(select: string[], option) => {
              store.setSku(option)
              store.updateFilter('sku_ids', select)
            }}
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('商品类型')}>
          <GmSelect
            all
            data={skuTypeList}
            value={sku_type}
            onChange={(value) => store.updateFilter('sku_type', value)}
          />
        </FormItem>

        <FormItem label={t('车间筛选')}>
          <Cascader
            style={{ width: '100%' }}
            multiple
            value={store.factoryData}
            maxTagCount={2}
            maxTagTextLength={5}
            options={factoryModalList}
            placeholder={t('全部')}
            onChange={(value: SingleValueType[]) => {
              const processor_ids = value.map(String)
              store.setfactoryData(value)
              store.updateFilter('processor_ids', processor_ids)
            }}
          />
        </FormItem>
      </FormBlock>
    </BoxForm>
  )
}

export default observer(MoreFilter)
