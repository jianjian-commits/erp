import { Collapse, Table } from 'antd'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import { ColumnType } from 'antd/lib/table'
import React from 'react'
import './style.less'

/**
 * 可折叠表格的属性
 */
interface CollapseTableProps<T> {
  className?: string
  header: string
  columns: ColumnType<T>[]
  data: T[]
}

/**
 * 折叠表格的组件函数，用来展示可折叠的表格
 * 因为使用了泛型，所以必须使用function来定义，不能使用const+箭头函数的形式
 */
function CollapseTable<T extends object>({
  className,
  header,
  columns,
  data,
}: CollapseTableProps<T>) {
  /**
   * 渲染组件
   */
  return (
    <Collapse className={className} defaultActiveKey={0} ghost>
      <CollapsePanel header={header} key={0}>
        <Table<T>
          style={{ overflowX: 'auto' }}
          // scroll的目的是防止滑动的时候产生异常的样
          // 详情见https://ant.design/components/table-cn/#components-table-demo-fixed-header
          scroll={{ x: 1200 }}
          size='middle'
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
        />
      </CollapsePanel>
    </Collapse>
  )
}

export default CollapseTable
