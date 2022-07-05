import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Popover } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'

import { renderAmountInfo } from '@/pages/production/util'
import { ByProductInfo } from '../../interface'

interface Props {
  products: ByProductInfo[]
}

const ByProducts: FC<Props> = ({ products }) => {
  const columns: Column<ByProductInfo>[] = [
    {
      Header: t('副产品编码'),
      accessor: 'customized_code',
      width: 120,
    },
    {
      Header: t('副产品'),
      accessor: 'sku_name',
    },
    {
      Header: t('基本单位'),
      accessor: 'base_unit_name',
    },
    {
      Header: t('产出数（基本单位）'),
      accessor: 'base_unit_output_amount_sum',
      Cell: (cellProps) => {
        const { base_unit_output_amount_sum } = cellProps.original
        return <div>{renderAmountInfo(base_unit_output_amount_sum || '')}</div>
      },
    },
  ]

  return (
    <Popover
      right
      type='hover'
      popup={<Table data={products} columns={columns} />}
    >
      <div className='gm-text-primary'>{products.length}</div>
    </Popover>
  )
}

export default ByProducts
