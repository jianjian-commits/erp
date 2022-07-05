import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { BoxForm, FormBlock, FormItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { ListProcessor } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import { Cascader, Input, Select } from 'antd'
import store from '../store'
import planStore from '@/pages/production/plan_management/plan/store'
import BatchesSelector from '@/pages/production/plan_management/plan/demand/components/filter/batches_selector'

/**
 * 更多筛选框的组件函数
 */
const MoreFilter: FC = () => {
  const [factoryModalList, setFactoryModalList] = useState<any[]>([])
  const [batch, setBatch] = useState<any>(null)

  const fetchFactoryModalList = () => {
    return ListProcessor({ paging: { limit: 999 } }).then((json) => {
      // 处理好数据
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

  useEffect(() => {
    fetchFactoryModalList()
  }, [])

  return (
    <BoxForm labelWidth='120px' colWidth='385px'>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('物料名称')}>
          <Select
            style={{ width: '100%' }}
            placeholder={t('请输入物料名称')}
            mode='multiple'
            showSearch
            allowClear
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
        <FormItem label={t('物料分类')}>
          <CategoryCascader
            style={{ width: '100%' }}
            multiple
            value={store.categoryIds}
            onChange={(value) => {
              store.setCategoryIds(value)
              const ids = value.map((id: any) => id[id.length - 1])
              store.updateFilter('category_ids', ids)
            }}
            showAdd={false}
            maxTagCount={2}
            maxTagTextLength={5}
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('车间筛选')}>
          <Cascader
            expandTrigger='hover'
            value={store.processor}
            style={{ width: '100%' }}
            multiple
            options={factoryModalList}
            placeholder={t('请选择所属车间')}
            onChange={(value, option) => {
              store.setProcessor(value)
              const ids = value.map((id: any) => id[id.length - 1])
              store.updateFilter('processor_ids', ids)
            }}
          />
        </FormItem>
        <FormItem label={t('领料单编号')}>
          <Input
            value={store.filter.material_order_serial_no}
            placeholder={t('请输入领料单编号')}
            onChange={(e) =>
              store.updateFilter('material_order_serial_no', e.target.value)
            }
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('领料出库单编号')}>
          <Input
            value={store.filter.stock_sheet_serial_no}
            placeholder={t('请输入领料出库单编号')}
            onChange={(e) =>
              store.updateFilter('stock_sheet_serial_no', e.target.value)
            }
          />
        </FormItem>
        <FormItem label={t('备注')}>
          <BatchesSelector
            productionOrderId={planStore.producePlanCondition.productionOrderId}
            isProduce={planStore.producePlanCondition.isProduce}
            selected={batch}
            onSelect={(selected) => {
              setBatch(selected)
              const value = selected?.value === -1 ? '' : selected?.text
              store.updateFilter('batch', value)
            }}
          />
        </FormItem>
      </FormBlock>
    </BoxForm>
  )
}

export default observer(MoreFilter)
