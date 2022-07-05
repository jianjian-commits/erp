import { t } from 'gm-i18n'
import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import { Task } from 'gm_api/src/production'

import store from '../../store'
import { toFixed, getUnitInfo } from '../../../util'

const ByProductDetail = observer(() => {
  const { task, units } = store.taskDetails

  // 副产品信息在task中
  const columns = useMemo(
    (): Column<Task>[] => [
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
      },
      {
        Header: t('产出数量(基本单位)'),
        accessor: 'output_amount',
        Cell: (cellProps) => {
          const { output_amount, unit_id } = cellProps.original
          const unit_name: string = getUnitInfo({
            unit_id,
            units: units!,
          }).unitName
          return (
            <div>
              {output_amount ? `${toFixed(output_amount)}${unit_name}` : '-'}
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <Table
      data={task?.by_products?.by_products?.slice() || []}
      columns={columns}
    />
  )
})

export default ByProductDetail
