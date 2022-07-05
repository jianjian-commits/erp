import React from 'react'
import { Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { TableData } from './types'
import { Tooltip } from 'antd'
import { parseFormula } from '@/common/components/formula/calculator'

const columns: Column<TableData>[] = [
  {
    Header: t('商品名称'),
    accessor: 'name',
  },
  {
    Header: t('公式'),
    accessor: 'formula',
    width: 350,
    Cell: ({ value }) => {
      const text =
        parseFormula(value)
          .map((item) => item.content)
          .join('') || '-'
      return (
        <Tooltip title={text} placement='topLeft'>
          <div
            style={{
              textOverflow: 'ellipsis',
              maxWidth: 'inherit',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        </Tooltip>
      )
    },
  },
]

export default columns
