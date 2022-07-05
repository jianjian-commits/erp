import React, { FC, useRef, ReactNode, useState, Key, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { toJS } from 'mobx'
import { Form, Select, Input, Button, Space, Tree, Row } from 'antd'
import store from './store'
import { DataNode, DataOption } from '@/common/interface'
import { formatCascaderData } from '@/common/util'
import './style.less'
import classNames from 'classnames'
import _ from 'lodash'

// 备注：产品说这个树暂时不要了，当保险起见，页面先保留
const Filter: FC = () => {
  const {
    treeData,
    treeDataMap,

    filter: { category_ids },
  } = store
  //   const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])

  useEffect(() => {
    const selectedKey = category_ids[category_ids.length - 1] || ''
    const expandedList = getExpandedKeys(selectedKey)

    selectedKey && setSelectedTreeKeys([selectedKey])
    setExpandedKeys(_.uniq([...expandedList, ...expandedKeys]))
  }, [category_ids])

  const onSelect = (selectedKeys: Key[]) => {
    setSelectedTreeKeys(selectedKeys)
    store.setFilter({
      category_ids: store.getParentIdList(selectedKeys[0]),
    } as any)
  }

  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys)
  }

  const getExpandedKeys = (selectedKey: Key) => {
    const list: Key[] = []
    const targetNode = treeDataMap[selectedKey]
    if (!targetNode) return list
    if (targetNode.parentId !== '0') {
      list.push(targetNode.parentId)
      const parentNode = treeDataMap[targetNode.parentId]
      if (parentNode.parentId !== '0') list.push(parentNode.parentId)
    }
    return list
  }

  return (
    <div
      className={classNames({
        'search-tree': true,
        'hidden-tree': !isFixedTree,
      })}
    >
      <Row justify='center' align='middle' className='category-tree-select'>
        <span className='category-tree-select-content'>
          {treeDataMap[selectedTreeKeys[0]]?.title || t('全部分类')}
        </span>
        <a
          onClick={() => {
            store.setFixedTree(false)
          }}
        >
          {t('收起')}
        </a>
      </Row>
      <Tree
        treeData={[
          {
            value: '00',
            title: '全部分类',
            key: '00',
            parentId: '',
          },

          ...treeData,
        ]}
        onSelect={onSelect}
        height={500}
        selectedKeys={selectedTreeKeys}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
      />
    </div>
  )
}

export default observer(Filter)
