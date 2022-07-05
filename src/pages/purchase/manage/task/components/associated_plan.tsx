import { toFixed } from '@/common/util'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Sku } from 'gm_api/src/merchandise'
import _ from 'lodash'
import React, { FC } from 'react'
import { TableData } from '../interface'
import store, { Task } from '../store'
import Big from 'big.js'

interface AssociatedPlanProps {
  task: Task
}

const AssociatedPlan: FC<AssociatedPlanProps> = ({ task }) => {
  const {
    request_details: { request_details },
    sku_id,
  } = task
  const { skuSnaps, rateMap } = store
  const list: TableData[] = _.map(
    _.filter(request_details, (v) => v.product_sku_id !== '0'),
    (rd) => {
      const sku = skuSnaps[sku_id] || {}
      const purchase_sku = skuSnaps[rd.product_sku_id!] || {}
      const rate = rateMap[sku_id]
      return {
        ...rd,
        purchase_sku: {
          ...purchase_sku,
          unit_name:
            globalStore.getUnitName(purchase_sku.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              purchase_sku.units?.units,
              purchase_sku?.purchase_unit_id!,
            ) ||
            '-',
        },
        sku: {
          ...sku,
          unit_name:
            globalStore.getUnitName(sku.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              sku.units?.units,
              sku?.purchase_unit_id!,
            ) ||
            '-',
        },
        rate,
      }
    },
  )
  return (
    <Flex flex column className='gm-padding-top-15'>
      <Table<TableData>
        style={{ width: '100%' }}
        data={list}
        columns={[
          {
            Header: t('计划编号'),
            minWidth: 120,
            id: 'request_sheet_serial_no',
            accessor: (d) => d.request_sheet_serial_no || '-',
          },
          {
            Header: t('生产成品'),
            accessor: 'sku',
            minWidth: 100,
            Cell: (cellProps) => {
              const purchase_sku: Sku = cellProps.original.purchase_sku
              return purchase_sku?.name! || '-'
            },
          },
          {
            Header: t('物料名称'),
            minWidth: 90,
            accessor: 'sku.name',
          },
          {
            Header: t('物料采购单位'),
            minWidth: 90,
            accessor: 'sku.unit_name',
            Cell: (cellProps) => cellProps.original.sku?.unit_name || '-',
          },
          {
            Header: t('需求数'),
            minWidth: 90,
            accessor: 'quantity',
            Cell: (cellProps) => {
              const {
                rate,
                sku: { unit_name },
              } = cellProps.original
              const unitValue = cellProps.original.val?.calculate!
              console.log('unitValue', unitValue)
              return (
                <span>
                  {unitValue?.quantity
                    ? toFixed(
                        +Big(unitValue?.quantity || 0).div(+rate || 1) || 0,
                      ) + unit_name
                    : '-'}
                </span>
              )
            },
          },
        ]}
      />
    </Flex>
  )
}

export default AssociatedPlan
