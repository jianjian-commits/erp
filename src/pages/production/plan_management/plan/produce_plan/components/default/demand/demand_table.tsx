import React, { FC, Key } from 'react'
import SelectTable, { Pagination } from '@/common/components/select_table'
import {
  ListTask,
  ListTaskRequest,
  map_BomType,
  Task_State,
  Task_Type,
} from 'gm_api/src/production'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import { TaskInfo } from '@/pages/production/plan_management/plan/interface'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import HeaderTip from '@/common/components/header_tip'
import { Flex } from '@gm-pc/react'
import { toFixed } from '@/pages/production/util'
import DemandFilter from './demand_filter'
import { handleTaskDetail } from '@/pages/production/plan_management/plan/util'
import _ from 'lodash'
import planStore from '@/pages/production/plan_management/plan/store'

const DemeandTable: FC<{ onSelect: (ids: Key[]) => void }> = ({ onSelect }) => {
  const handleFetchList = (paging: Pagination, params: ListTaskRequest) => {
    const param = {
      ...params,
      state: Task_State.STATE_PREPARE,
      production_order_ids: [planStore.producePlanCondition.productionOrderId],
    }
    return ListTask({ ...param, paging }).then((json) => {
      const { task_details, paging, ...res } = json.response

      return {
        list: _.map(task_details, (v) => {
          return handleTaskDetail({ task_detail: v, info: { ...res } })
        }),
        count: paging.count,
      }
    })
  }

  const columns: ColumnType<TaskInfo>[] = [
    {
      title: t('生产成品'),
      fixed: 'left',
      width: 150,
      render: (_, v) => v.skuName,
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={
            <Flex column alignCenter justifyCenter>
              <span>{t('需求数')}</span>
              <span>{`(${t('基本单位')}）`}</span>
            </Flex>
          }
        />
      ),
      width: 150,
      render: (_, { order_amount, unit_name, type }) => (
        <div>
          {type === Task_Type.TYPE_PACK
            ? '-'
            : `${toFixed(order_amount || '0')}${unit_name}`}
        </div>
      ),
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={
            <Flex column alignCenter justifyCenter>
              <span>{t('需求数')}</span>
              <span>{`(${t('包装单位')}）`}</span>
            </Flex>
          }
        />
      ),
      width: 150,
      render: (_, { order_amount, unit_name, type }) => (
        <div>
          {type === Task_Type.TYPE_PACK
            ? `${toFixed(order_amount || '0')}${unit_name}`
            : '-'}
        </div>
      ),
    },
    {
      title: t('关联客户'),
      width: 150,
      render: (_, v) => v.customerName || '-',
    },
    {
      title: t('关联线路'),
      width: 150,
      render: (_, v) => v.routerName || '-',
    },
    {
      title: t('需求备注'),
      width: 150,
      render: (_, v) => v.batch,
    },
    {
      title: t('BOM名称'),
      width: 150,
      render: (_, v) => v.bom_name,
    },
    {
      title: t('BOM类型'),
      width: 150,
      render: (_, v) => map_BomType[v.type!],
    },
    {
      title: t('商品类型'),
      width: 150,
      render: (_, v) => map_Sku_NotPackageSubSkuType[v.sku_type!],
    },
    {
      title: t('物料类型'),
      width: 150,
      render: (_, { sku_id, order_sku_id }) =>
        sku_id === order_sku_id ? t('成品') : t('半成品'),
    },
  ]

  return (
    <SelectTable<TaskInfo, any>
      rowKey='task_id'
      selectedKey='skuName'
      columns={columns}
      onSearch={handleFetchList}
      onSelect={onSelect}
      FilterComponent={DemandFilter}
    />
  )
}

export default DemeandTable
