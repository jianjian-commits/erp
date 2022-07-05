import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Table } from '@gm-pc/table-x'
import { BoxTable, BoxTableInfo } from '@gm-pc/react'

import TableTotalText from '@/common/components/table_total_text'

import store from '../store'

const CustomerTable = () => {
  const tableInfo = [
    { label: '商户数', content: store.relation_customers.length },
  ]

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText data={tableInfo} />
        </BoxTableInfo>
      }
    >
      <Table
        data={store.computedRelationCustomers.slice()}
        columns={[
          {
            Header: t('商户ID'),
            accessor: 'customized_code',
          },
          {
            Header: t('商户名'),
            accessor: 'name',
            width: 190,
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(CustomerTable)
