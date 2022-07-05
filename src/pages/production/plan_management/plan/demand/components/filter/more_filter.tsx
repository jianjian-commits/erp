import { BoxForm, FormItem, MoreSelectDataItem, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'
import planStore from '@/pages/production/plan_management/plan/store'
import { Task_Produce_Type_Enum } from '@/pages/production/enum'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { list_Task_State } from 'gm_api/src/production'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import store from '@/pages/production/plan_management/plan/demand/store'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { observer } from 'mobx-react'
import { Row, Col } from 'antd'
import { TaskMaterialType } from '@/pages/production/plan_management/plan/demand/enum'
import BatchesSelector from '@/pages/production/plan_management/plan/demand/components/filter/batches_selector'
import {
  ProductionDropFilter,
  Select_BOM_Type,
} from '@/pages/production/plan_management/plan/components/production_select_name'

const MoreFilter: FC<{}> = () => {
  const { isProduce, productionOrderId } = planStore.producePlanCondition
  const {
    skuSelect,
    serial_no,
    task_type,
    category_ids,
    state,
    sku_type,
    customerIds,
    routeIds,
    batch,
    is_finishe_product,
  } = store.filter
  return (
    <BoxForm labelWidth='107px' colWidth='385px'>
      <Row>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem>
            <ProductionDropFilter
              value={{
                serial_no: serial_no || '',
                skuSelect: skuSelect!,
              }}
              bomType={
                isProduce ? Select_BOM_Type.product : Select_BOM_Type.pack
              }
              onChange={(key, value) => store.updateFilter(key, value)}
            />
          </FormItem>
        </Col>
        {isProduce && (
          <Col span={12} className='gm-margin-bottom-10'>
            <FormItem label={t('BOM类型')}>
              <Select
                value={task_type}
                onChange={(value) => store.updateFilter('task_type', value)}
                data={Task_Produce_Type_Enum}
              />
            </FormItem>
          </Col>
        )}
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('分类')}>
            <CategoryCascader
              value={category_ids}
              style={{ width: '100%' }}
              multiple
              onChange={(value) => {
                store.updateFilter('category_ids', value as string[])
              }}
              maxTagCount={2}
              maxTagTextLength={5}
            />
          </FormItem>
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('需求状态')}>
            <Select
              all
              data={list_Task_State}
              value={state}
              onChange={(value) => store.updateFilter('state', value)}
            />
          </FormItem>
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('物料类型')}>
            <Select
              data={TaskMaterialType}
              value={is_finishe_product}
              onChange={(value) =>
                store.updateFilter('is_finishe_product', value)
              }
            />
          </FormItem>
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('商品类型')}>
            <Select
              all
              data={list_Sku_NotPackageSubSkuType}
              value={sku_type}
              onChange={(value) => store.updateFilter('sku_type', value)}
            />
          </FormItem>
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('客户筛选')}>
            <MoreSelect_Customer
              multiple
              params={{ level: 2, type: 2 }}
              selected={customerIds}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                store.updateFilter('customerIds', value)
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
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('线路筛选')}>
            <MoreSelect_Route
              multiple
              selected={routeIds}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                store.updateFilter('routeIds', value)
              }
              placeholder={t('全部')}
              getResponseData={(data) => {
                data.routes.unshift({
                  route_id: '0',
                  route_name: t('无'),
                })
                return data.routes
              }}
              getName={(item) => item.route_name!}
            />
          </FormItem>
        </Col>
        <Col span={12} className='gm-margin-bottom-10'>
          <FormItem label={t('需求备注')}>
            <BatchesSelector
              productionOrderId={productionOrderId}
              isProduce={isProduce}
              selected={batch!}
              onSelect={(selected) => store.updateFilter('batch', selected)}
            />
          </FormItem>
        </Col>
      </Row>
    </BoxForm>
  )
}

export default observer(MoreFilter)
