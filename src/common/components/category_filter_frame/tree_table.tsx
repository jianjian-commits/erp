/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, Key, useEffect, useMemo } from 'react'
import { TreeTableProps } from './data'
import { Row, Col, Tree, Tooltip } from 'antd'
import { VerticalRightOutlined, DownOutlined } from '@ant-design/icons'

import { ComponentContext, DEFAULT_TREE_NAME_ENUM } from './constants'
import { t } from 'gm-i18n'
import { getCategoryValue } from './utils'
import classNames from 'classnames'

const TreeTable = (props: TreeTableProps) => {
  const { table, treeData, form, onFilterChange, defaultAllClassifyTitle } =
    props

  const {
    isExpandTree,
    setExpandTree,
    selectedKeys,
    setSelectedKeys,
    treeDataMap,
  } = useContext(ComponentContext)

  const DEFAULT_TREE_NAME = useMemo(
    () => defaultAllClassifyTitle || DEFAULT_TREE_NAME_ENUM.name,
    [defaultAllClassifyTitle],
  )

  const [title, setTitle] = useState(DEFAULT_TREE_NAME)

  /** 树展开节点 */
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([
    DEFAULT_TREE_NAME_ENUM.key,
  ])

  useEffect(() => {
    //
    getTreeTitleAndExpandKey()
  }, [isExpandTree])

  /** 获取树的title 和 展开的节点 */
  const getTreeTitleAndExpandKey = () => {
    const formValue = form.getFieldsValue()
    const { category_ids } = formValue
    const node = treeDataMap[selectedKeys[0]]
    setExpandedKeys(category_ids)
    setTitle(node ? (node.title as string) : DEFAULT_TREE_NAME)
  }

  /** 分类树节点选择事件 */
  const onTreeNodeSelect = (selectedKeys: Key[], e: any) => {
    const { node } = e
    setSelectedKeys(selectedKeys)
    const category_ids = getCategoryValue(selectedKeys, treeDataMap)
    form.setFieldsValue({ category_ids })
    const formValue = form.getFieldsValue()
    setTitle(node.title)
    if (typeof onFilterChange === 'function') {
      onFilterChange({ ...formValue, category_ids })
    }
  }

  const handleTitleRender = (nodeData: any) => {
    return nodeData.title.length > 10 ? (
      <Tooltip title={nodeData.title}>
        <span>{`${nodeData.title.substring(0, 10)}...`}</span>
      </Tooltip>
    ) : (
      <span>{nodeData.title}</span>
    )
  }

  /** 分类树展开事件 */
  const onTreeExpand = (keys: Key[]) => {
    setExpandedKeys(keys)
  }

  return (
    <Row className='gm-site-card-border-less-wrapper-106'>
      {/* 分类树 */}
      <Col
        className={classNames('category-tree', {
          hide: !isExpandTree,
        })}
      >
        <Row
          justify='space-between'
          align='middle'
          className='category-tree-select'
        >
          {t(title).length > 10 ? (
            <Tooltip title={t(title)}>
              <span className='category-tree-select-content'>
                {`${t(title).substring(0, 10)}...`}
              </span>
            </Tooltip>
          ) : (
            <span className='category-tree-select-content'>{t(title)}</span>
          )}

          <a onClick={() => setExpandTree(false)}>
            <VerticalRightOutlined
              className='right-out-lined'
              rotate={90}
              style={{ color: '#5f5f5f', fontSize: '18px' }}
            />
          </a>
        </Row>
        <Tree
          className='tree-style'
          treeData={[
            {
              value: DEFAULT_TREE_NAME_ENUM.key,
              title: DEFAULT_TREE_NAME,
              key: DEFAULT_TREE_NAME_ENUM.key,
              parentId: '0',
            },

            ...treeData,
          ]}
          onSelect={onTreeNodeSelect}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onExpand={onTreeExpand}
          switcherIcon={<DownOutlined />}
          titleRender={handleTitleRender}
          blockNode
        />
      </Col>
      <Col
        className={classNames('category-table', {
          'mini-table': isExpandTree,
        })}
      >
        {/* 列表 */}
        {table}
      </Col>
    </Row>
  )
}

export default TreeTable
