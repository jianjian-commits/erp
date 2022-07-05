import React from 'react'
import { observer } from 'mobx-react'
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { message, Tree, Modal, Space, Button } from 'antd'
import { t } from 'gm-i18n'
import TreeTitle from './tree_title'
import store from '../store'
import _ from 'lodash'
import { DataNode } from '../interface'

const { TreeNode } = Tree

const List = observer(() => {
  const handleEdit = (level: string, customer_id: string) => {
    if (level === '1') {
      window.open(
        `#/customer/school/class_management/detail?customer_id=${customer_id}`,
      )
    } else {
      window.open(
        `#/customer/school/class_management/create_class?class_id=${customer_id}`,
      )
    }
  }
  const handleCreate = (customer_id: string) => {
    window.open(
      `#/customer/school/class_management/create_class?customer_id=${customer_id}`,
    )
  }

  const handleLook = (level: string, customer_id: string) => {
    if (level === '1') {
      window.open(
        `#/customer/school/class_management/detail?customer_id=${customer_id}&is_look=${true}`,
      )
    } else {
      window.open(
        `#/customer/school/class_management/create_class?class_id=${customer_id}&is_look=${true}`,
      )
    }
  }
  const handleDelete = (customer_id: string, name: string) => {
    Modal.confirm({
      title: t('删除提示'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确认删除${name}?`),
      okText: '确认',
      onOk: () => {
        store.deleteCustomer(customer_id).then(() => {
          message.success(t('删除成功'))
          store.fetchSchoolList()
        })
      },
      cancelText: '取消',
    })
  }
  const renderTree = (arr: DataNode[]) => {
    if (arr?.length <= 0 || !arr) return null
    return arr?.map((item) => (
      <>
        <TreeNode
          className='class-tree-tree-node'
          key={item.key}
          title={
            <TreeTitle
              title={item.title}
              level={item.level}
              handleEdit={() => handleEdit(item.level, item.customer_id!)}
              handleLook={() => {
                handleLook(item.level, item.customer_id!)
              }}
              handleCreate={() => handleCreate(item.customer_id!)}
              handleDelete={() => handleDelete(item.customer_id!, item.name!)}
            />
          }
        >
          {renderTree(item.children || [])}
        </TreeNode>
      </>
    ))
  }
  return (
    <div className='gm-site-card-border-less-wrapper-114'>
      <div className='tree-title'>
        {t('学校总数:')}
        {store.count || 0}
      </div>

      <Tree
        className='category-tree-table'
        blockNode
        selectable={false}
        autoExpandParent={false}
        switcherIcon={
          <DownOutlined
            style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)' }}
          />
        }
      >
        {renderTree(store.schoolList)}
      </Tree>
    </div>
  )
})

export default List
