import { Task_Produce_Type_All_Enum } from '@/pages/production/enum'

import { BoxForm, BoxFormMore, MoreSelectDataItem, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  list_Sku_NotPackageSubSkuType,
  Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import {
  ProductionSelectName,
  Select_BOM_Type,
} from '@/pages/production/plan_management/plan/components/production_select_name'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { Filter } from '@/pages/production/plan_management/plan/demand/interface'
import { Task_Type } from 'gm_api/src/production'
import { getDemandParams } from '@/pages/production/plan_management/plan/produce_plan/util'
import { Col, Row } from 'antd'
import { TaskMaterialType } from '@/pages/production/plan_management/plan/demand/enum'

const initFilter: Filter = {
  task_type: Task_Type.TYPE_UNSPECIFIED,
  category_ids: [],
  sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
  customerIds: [],
  routeIds: [],
  batch_info: '',
  q: '',
}

const DemandFilter = forwardRef<any, { fetchList: any }>(
  ({ fetchList }, ref) => {
    const [demandFilter, setDemandFilter] = useState<Filter>({ ...initFilter })
    const {
      sku_type,
      task_type,
      customerIds,
      routeIds,
      skuSelect,
      is_finishe_product,
    } = demandFilter

    useImperativeHandle(ref, () => ({
      onFinish,
    }))

    const onFinish = (isResetCurrent?: boolean, data?: Filter) => {
      const params = data ?? demandFilter
      fetchList(
        {
          ...getDemandParams(params),
          task_types: params?.task_type ? [params?.task_type] : undefined,
        },
        isResetCurrent,
      )
    }

    const handleUpdateFilter = <T extends keyof Filter>(
      key: T,
      value: Filter[T],
    ) => {
      setDemandFilter((v) => {
        const data = {
          ...v,
          [key]: value,
        }
        onFinish(true, data)
        return data
      })
    }
    return (
      <BoxForm>
        <Row align='middle' gutter={12}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              all={{ text: t('全部商品类型') }}
              data={list_Sku_NotPackageSubSkuType}
              value={sku_type}
              onChange={(value) => handleUpdateFilter('sku_type', value)}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={task_type}
              onChange={(value) => handleUpdateFilter('task_type', value)}
              data={Task_Produce_Type_All_Enum}
            />
          </Col>
          <Col span={6}>
            <div style={{ width: '268px' }}>
              <ProductionSelectName
                bomType={Select_BOM_Type.all}
                selectData={skuSelect!}
                onChange={(value) => handleUpdateFilter('skuSelect', value)}
              />
            </div>
          </Col>
        </Row>
        <BoxFormMore>
          <Row align='middle' gutter={12} className='gm-margin-top-10'>
            <Col span={6}>
              <MoreSelect_Customer
                multiple
                params={{ level: 2, type: 2 }}
                selected={customerIds}
                renderListFilterType='pinyin'
                onSelect={(select?: MoreSelectDataItem<string>[]) =>
                  handleUpdateFilter('customerIds', select!)
                }
                getResponseData={(data) => {
                  data.customers.unshift({
                    customer_id: '1',
                    name: t('无'),
                    type: 0,
                  })
                  return data.customers
                }}
                placeholder={t('全部客户')}
              />
            </Col>
            <Col span={6}>
              <MoreSelect_Route
                multiple
                selected={routeIds}
                renderListFilterType='pinyin'
                onSelect={(value: MoreSelectDataItem<string>[]) =>
                  handleUpdateFilter('routeIds', value)
                }
                getName={(item) => item.route_name!}
                placeholder={t('全部线路')}
              />
            </Col>
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                data={TaskMaterialType}
                value={is_finishe_product}
                onChange={(value) =>
                  handleUpdateFilter('is_finishe_product', value)
                }
                placeholder={t('选择物料类型')}
              />
            </Col>
          </Row>
        </BoxFormMore>
      </BoxForm>
    )
  },
)

export default DemandFilter
