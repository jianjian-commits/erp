import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableProps } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'

import store from '../store'

type ListProps = Pick<BoxTableProps, 'pagination'> & {
  run: Function
  loading: boolean
  columns: Column<any>[]
  info?: any
}

const List: FC<ListProps> = observer(
  ({ pagination, loading, columns, info }) => {
    const { list } = store
    return (
      <BoxTable pagination={pagination} info={info}>
        <Table
          isDiy
          id='inventory_overview'
          keyField='sku_id'
          fixedSelect
          data={list}
          columns={columns}
          loading={loading}
        />
      </BoxTable>
    )
  },
)

export default List
