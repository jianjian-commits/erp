import React, { useMemo, FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Table, Column } from '@gm-pc/table-x'
import store from '../store'
import _ from 'lodash'
import { toFixed, getSpec, getSourceUnitName } from '@/pages/production/util'
import { TaskSourceItem } from '../interface'
import { TaskSource_SourceType } from 'gm_api/src/production'
import { TypeText } from '@/pages/production/interface'

interface Props {
  task: {
    [key in keyof TypeText]?: boolean
  }
  sourceType?: TaskSource_SourceType
}

const BeforePack: FC<Props> = ({ task: { isOrder }, sourceType }) => {
  const { task_sources_group, skus } = store.taskDetails
  const [list, setList] = useState<TaskSourceItem[]>([])

  useEffect(() => {
    setList(
      _.map(
        task_sources_group![sourceType!]!,
        ({ source_sku_id, source_unit_id, sku_remark, ...other }) => {
          return {
            unit_name: getSourceUnitName({
              sku_id: source_sku_id!,
              unit_id: source_unit_id!,
              skus,
            }),
            sku_name: skus?.[source_sku_id!]?.sku?.name || '-',
            sku_remark: sku_remark || '-',
            ...other,
          }
        },
      ),
    )
  }, [task_sources_group])

  const columns = useMemo(
    () =>
      (
        [
          isOrder && {
            Header: t('商户名'),
            accessor: 'customer_name',
          },
          isOrder && {
            Header: t('订单号'),
            accessor: 'source_order_serial_no',
          },
          !isOrder && {
            Header: t('计划编号'),
            accessor: ({ source_task_serial_no }) =>
              source_task_serial_no || '-',
          },
          {
            Header: t(isOrder ? '商品' : '生产成品'),
            accessor: 'sku_name',
          },
          {
            Header: t('需求数'),
            Cell: ({ original: { source_demand_number, unit_name } }) => {
              return <div>{toFixed(source_demand_number!) + unit_name}</div>
            },
          },
          isOrder && {
            Header: t('备注'),
            accessor: 'sku_remark',
          },
        ] as Column<TaskSourceItem>[]
      ).filter(Boolean),
    [],
  )

  return (
    <Table
      className='gm-margin-10'
      data={list.slice()}
      columns={columns}
      border
    />
  )
}

export default BeforePack
