import React, { useState, useRef } from 'react'
import { Table, InputNumber, Select, message, Button } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import classNames from 'classnames'
import '../../style.less'
import { PlusCircleOutlined } from '@ant-design/icons'

const unitOptions = [{ label: t('斤'), value: 1 }]

const initData = [
  {
    id: '1',
    name: '白菜',
    unit: '斤',
    list: [
      {
        childId: '1-1',
        unit: '斤',
        product_price: '10元/斤',
        min_order: '10jin',
        state: '上架',
      },
      {
        childId: '1-2',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
    ],
  },
  {
    id: '2',
    name: '包菜',
    list: [
      {
        childId: '2-1',
        unit: '斤',
        product_price: '10元/斤',
        min_order: '10jin',
        state: '上架',
      },
      {
        childId: '2-2',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
    ],
  },
  {
    id: '3',
    name: '包菜',
    list: [
      {
        childId: '3-1',
        unit: '斤',
        product_price: '10元/斤',
        min_order: '10jin',
        state: '上架',
      },
      {
        childId: '3-2',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
      {
        childId: '3-3',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
    ],
  },
  {
    id: '4',
    name: '包菜',
    list: [
      {
        childId: '4-1',
        unit: '斤',
        product_price: '10元/斤',
        min_order: '10jin',
        state: '上架',
      },
      {
        childId: '4-2',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
      {
        childId: '4-3',
        unit: '斤',
        product_price: '12元/斤',
        min_order: '12jin',
        state: '上架',
      },
    ],
  },
]

const InfoTable = () => {
  const [dataSource, setDataSource] = useState(initData)

  const tableRef = useRef(null)

  const expandedRowRender = (record, index, indent, expanded) => {
    // TODO: 写一个方法判断 isWaring 的状态
    const isWaring = true
    const columns = [
      {
        title: '下单单位',
        dataIndex: 'unit',
        key: 'unit',
        render: () => {
          return <Select options={unitOptions} style={{ width: 120 }} />
        },
      },
      {
        title: '商品定价',
        key: 'product_price',
        width: '250px',
        dataIndex: 'product_price',
        render: () => {
          return (
            <>
              ¥
              <InputNumber min={1} max={10} defaultValue={3} /> /
              <Select
                options={unitOptions}
                style={{ width: 80 }}
                placeholder={t('请选择')}
              />
            </>
          )
        },
      },
      {
        title: '最小起订数',
        dataIndex: 'min_order',
        key: 'min_order',
        render: () => {
          return (
            <>
              <InputNumber min={1} max={10} defaultValue={3} />
              {t('瓶')}
            </>
          )
        },
      },

      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'right',
        render: (text, row) => (
          <a onClick={() => handleDeleteRow(record, index, row.childId)}>
            删除
          </a>
        ),
      },
    ]

    return (
      <div
        id={record.id}
        className={classNames({
          'expanded-row-render-table-warning': isWaring,
        })}
      >
        <Table
          rowKey='childId'
          columns={columns as any}
          dataSource={record.list}
          pagination={false}
          showHeader={false}
        />
        <Button
          type='link'
          icon={<PlusCircleOutlined />}
          onClick={() => handleAddRow(record, index)}
        >
          {t('增加一行')}
        </Button>
      </div>
    )
  }
  // 增加字表行
  const handleAddRow = (record, index) => {
    console.log('handleAddRow', toJS(record), index)
    record.list.splice(record.list.length, 0, {
      childId: '1-3' + index + Math.random(),
      unit: '斤',
      product_price: '12元/斤',
      min_order: '12jin',
      state: '上架',
    })
    // 触发渲染
    dataSource[index].list = [...dataSource[index]?.list]
    setDataSource([...dataSource])
  }

  const columns = [
    {
      title: '下单单位',
      dataIndex: 'unit',
      key: 'unit',
      render: () => {
        return (
          <div style={{ fontSize: '16px', fontWeight: 600 }}>超级大白菜</div>
        )
      },
    },
    {
      title: '商品定价',
    },
    {
      title: '最小起订数',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'right',
    },
  ]

  // 删除字表行
  const handleDeleteRow = (record, index: number, id: string) => {
    console.log('handleDelete', toJS(record), index, id)
    if (record.list.length === 1) {
      // TODO: 找产品要提示文案
      message.error(t('留一条'))
      return
    }
    record.list.splice(index, 1)
    // 触发渲染
    dataSource[index].list = [...dataSource[index]?.list]
    setDataSource([...dataSource])
  }

  /**
   * 校验表单必填项
   */
  const verifyTableData = () => {
    // 每个子表格绑定报价单Id,拿到所有的没填完的 子表的报价单Id
    const table = document.getElementById('4')
    table &&
      table.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
  }

  return (
    <>
      <Table
        id='test_table'
        rowKey='id'
        className='components-table-demo-nested'
        columns={columns as any}
        pagination={false}
        expandable={{
          expandedRowRender,
          defaultExpandAllRows: true,
        }}
        scroll={{ y: 400 }}
        size='middle'
        dataSource={dataSource}
      />
    </>
  )
}

export default observer(InfoTable)
