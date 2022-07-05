import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { Task } from '../store'
import _ from 'lodash'
import globalStore from '@/stores/global'
import {
  PurchaseTask_RequestSource,
  PurchaseTask_Status,
} from 'gm_api/src/purchase'
import { Permission } from 'gm_api/src/enterprise'

interface PrePlanProps {
  task: Task
  data: { [key: string]: any }[]
  onDelete(index: number): void
}

const PrePlan: FC<PrePlanProps> = ({ task, data, onDelete }) => {
  return (
    <Flex flex column className='gm-padding-top-15'>
      <Table
        style={{ width: '100%' }}
        data={_.filter(
          data,
          (d) => d.request_source === PurchaseTask_RequestSource.MANUAL,
        )}
        columns={[
          {
            Header: t('计划编号'),
            minWidth: 120,
            id: 'request_sheet_serial_no',
            accessor: (d: any) => d.request_sheet_serial_no || '-',
          },
          { Header: '商品', minWidth: 90, accessor: 'name' },
          {
            Header: '商品等级',
            minWidth: 90,
            Cell: (cellProps) => {
              const { level_field_id } = cellProps.original
              const sku_level = cellProps.original?.sku_level?.sku_level! || []

              const levelName =
                _.find(sku_level, (i) => i.level_id === level_field_id)?.name ||
                '-'
              return levelName
            },
          },
          { Header: '采购单位', minWidth: 90, accessor: 'unit_name' },
          {
            Header: '需求数',
            minWidth: 90,
            accessor: 'need',
            Cell: (cellProps) =>
              cellProps.original.need + cellProps.original.unit_name,
          },
          {
            Header: TableXUtil.OperationHeader,
            id: 'action',
            diyItemText: '操作',
            accessor: 'op',
            fixed: 'right',
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            Cell: (cellProps) => {
              const {
                original: { name, _index },
              } = cellProps
              return task?.status === PurchaseTask_Status.PREPARE ? (
                <TableXUtil.OperationDelete
                  disabled={
                    !globalStore.hasPermission(
                      Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_SHEET,
                    )
                  }
                  title={t('警告')}
                  onClick={() => onDelete(_index)}
                >
                  {`确认删除${name}吗`}
                </TableXUtil.OperationDelete>
              ) : (
                '-'
              )
            },
          },
        ]}
      />
    </Flex>
  )
}

export default PrePlan
