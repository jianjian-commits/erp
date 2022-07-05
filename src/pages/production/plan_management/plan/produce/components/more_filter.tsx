import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { BoxForm, FormBlock, FormItem, Select } from '@gm-pc/react'
import { Input } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../store'
import SelectName from './select_name'
import { list_TaskOutput_State } from '@/pages/production/plan_management/plan/produce/utils'
import { skuTypeList } from '@/pages/production/plan_management/plan/produce/enum'
interface Props {
  isProduce: boolean
}
const MoreFilter: FC<Props> = ({ isProduce }) => {
  const { state, sku_type, stock_sheet_serial_no } = store.filter

  return (
    <BoxForm labelWidth='107px' colWidth='385px'>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('成品名称')}>
          <SelectName isProduce={isProduce} width='100%' />
        </FormItem>
        <FormItem label={t('商品分类')}>
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
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('状态')}>
          <Select
            all={{ value: 0 }}
            style={{ width: '100%' }}
            data={list_TaskOutput_State}
            value={state}
            onChange={(value: number) => store.updateFilter('state', value)}
          />
        </FormItem>
        <FormItem label={t('商品类型')}>
          <Select
            all
            style={{ width: '100%' }}
            data={skuTypeList}
            value={sku_type}
            onChange={(value) => store.updateFilter('sku_type', value)}
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('入库单编号')}>
          <Input
            value={stock_sheet_serial_no}
            placeholder={t('请输入入库单编号')}
            onChange={(e) =>
              store.updateFilter('stock_sheet_serial_no', e.target.value)
            }
          />
        </FormItem>
      </FormBlock>
    </BoxForm>
  )
}

export default observer(MoreFilter)
