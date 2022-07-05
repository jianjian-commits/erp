import React from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { BoxTable, BoxTableInfo, MoreSelect } from '@gm-pc/react'
import _ from 'lodash'
import TableTotalText from '@/common/components/table_total_text'

import store from '../store'

const { OperationCell, EditOperation, OperationHeader, TABLE_X } = TableXUtil

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
      <Table<any>
        isEdit
        data={store.computedRelationCustomers.slice()}
        columns={[
          {
            Header: OperationHeader,
            id: 'operation',
            fixed: 'left',
            width: TABLE_X.WIDTH_OPERATION,
            Cell: (cellProps) => {
              const { index } = cellProps
              return (
                <OperationCell>
                  <EditOperation
                    onAddRow={() => {
                      store.addRow('customer', index)
                    }}
                    onDeleteRow={() => {
                      store.deleteRow('customer', index)
                    }}
                  />
                </OperationCell>
              )
            },
          },
          {
            Header: t('商户ID'),
            accessor: 'customized_code',
          },
          {
            Header: t('商户名'),
            accessor: 'customer_name',
            width: 190,
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const comCustomer = _.map(
                      store.customerList,
                      (customer) => {
                        return {
                          ...customer,
                          text: customer.name,
                          value: customer.customer_id,
                        }
                      },
                    )
                    const selected = _.find(
                      comCustomer,
                      (customer) =>
                        customer.customer_id === original.customer_id,
                    )
                    return (
                      <MoreSelect
                        disabledClose
                        data={comCustomer}
                        selected={selected}
                        onSelect={(selected: any) => {
                          store.addCustomer(selected.value, index)
                        }}
                      />
                    )
                  }}
                </Observer>
              )
            },
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(CustomerTable)
