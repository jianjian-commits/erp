import React from 'react'
import { observer } from 'mobx-react'
import { Table, Button, Divider, Card, Modal, Tag, message } from 'antd'
import BatchActionBar from '@/common/components/batch_action_bar'
import { ColumnType } from 'antd/lib/table'

/** 商品分类管理 */
const List = () => {
  const columns: any = []

  const rowSelection = {}

  return (
    <Table
      childrenColumnName='items'
      rowKey='id'
      style={{ marginTop: '16px' }}
      columns={columns as ColumnType<any>[]}
      expandable={{
        defaultExpandAllRows: true,
        expandedRowKeys: [],
      }}
      rowSelection={rowSelection}
      dataSource={[]}
      pagination={false}
    />
  )
}

export default observer(List)
