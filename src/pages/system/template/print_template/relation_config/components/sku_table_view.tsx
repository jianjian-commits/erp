import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Table } from '@gm-pc/table-x'
import { BoxTable, BoxTableInfo } from '@gm-pc/react'
import _ from 'lodash'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'

const SkuTable = () => {
  const tableInfo = [{ label: '商品数', content: store.relation_skus.length }]

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText data={tableInfo} />
        </BoxTableInfo>
      }
    >
      <Table<any>
        data={store.computedRelationSkus.slice()}
        columns={[
          {
            Header: t('商品ID'),
            accessor: 'sku_id',
            Cell: ({ original }) => {
              return `${original.sku.customize_code || ''}`
            },
          },
          {
            Header: t('商品名'),
            accessor: 'sku_name',
            width: 190,
            Cell: ({ original }) => {
              return `${original?.sku?.name || ''}`
            },
          },
          {
            Header: t('所属分类'),
            accessor: 'category',
            width: 190,
            Cell: ({ original }) => {
              const ctg = _.map(
                original.category_infos,
                (ctg) => ctg.category_name,
              ).join('/')
              return ctg
            },
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(SkuTable)
