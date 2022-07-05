import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import _ from 'lodash'
import { PurchaseTask_RequestSource } from 'gm_api/src/purchase'

interface SplitNumberTabsProps {
  data: { [key: string]: any }[]
}

const SplitNumberTabs: FC<SplitNumberTabsProps> = ({ data }) => {
  return (
    <Flex flex column className='gm-padding-top-15'>
      <Table
        style={{ width: '100%' }}
        data={_.filter(
          data,
          (d) => d.request_source === PurchaseTask_RequestSource.PURCHASE_TASK,
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
        ]}
      />
    </Flex>
  )
}

export default SplitNumberTabs
