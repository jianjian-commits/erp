/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, Key } from 'react'
import { Tree, Spin, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import store, { GoUpProps } from '../store'
import { observer } from 'mobx-react'
import { DataNode } from '@/common/interface'
import { t } from 'gm-i18n'
import TreeTitle from './tree_title'
import CreateSonCategory, {
  CreateSonCategoryRef,
} from '../components/create_son_category'
import AddCategory, { AddCategoryRef } from '../components/create_category'
import globalStore from '@/stores/global'

const { TreeNode } = Tree
const treeTableStyle = {
  border: '1px splid red',
  padding: '0px 24px 16px 24px',
  // display: 'flex',
  // justifyContent: 'space-between',
  // borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
}

/** 轻巧版下节点的显示 */
const getLiteNode = (level: number | undefined) => {
  if (!level) return false
  if (globalStore.isLite) {
    if (level >= 2) return false
  }
  return true
}

/** 分类管理树 */
const TreeTable = () => {
  const { treeData, expandedKeys, autoExpandParent } = store

  /** 根节点分类弹窗ref */
  const catagoryRef = useRef<AddCategoryRef>(null)

  /** 子分类弹窗ref */
  const modalRef = useRef<CreateSonCategoryRef>(null)

  /** 新建子节点 */
  const handleCreate = (node: DataNode) => {
    modalRef.current && modalRef.current.handleOpen(node)
  }

  /** 编辑节点 */
  const handleEdit = (node: DataNode) => {
    const { level } = node
    if (level === 1) {
      catagoryRef.current && catagoryRef.current.handleOpen(node)
      return
    }
    modalRef.current && modalRef.current.handleOpen(node, 'edit')
  }

  /** 删除节点 */
  const handleDelete = (id: string) => {
    store.handleDeleteCategory(id).then(() => {
      message.success('操作成功')
      store.getTreeData()
    })
  }

  /** 节点展开的方法 */
  const onExpand = (expandedKeys: Key[]) => {
    const { isDrop } = store.sortCategory // 拖拉排序过程，禁止展开二级分类
    if (isDrop && globalStore.isLite) return
    store.setExpandedKeys(expandedKeys)
    store.setAutoExpandParent(false)
  }

  /**
   * @description 树节点的渲染，需要对节点进行改造，故不使用 treeData
   */
  const renderTreeNode = (treeData: DataNode[]) => {
    if (treeData.length <= 0 || !treeData) return null

    return treeData.map((item) => (
      <TreeNode
        className={`ant-tree-treenode-${item.level}`}
        key={item.key}
        title={
          // 所有的逻辑放在
          <TreeTitle
            node={item}
            handleEdit={handleEdit}
            handleCreate={handleCreate}
            handleDelete={handleDelete}
            handleGoUp={({ key, level, parentId }: GoUpProps) =>
              store.upGo({ key, level, parentId })
            } // 排序置顶
          />
        }
      >
        {getLiteNode(item.level) && renderTreeNode(item.children || [])}
      </TreeNode>
    ))
  }

  /**
   * 过滤节点 增加颜色
   */
  const filterTreeNode = (treeData: DataNode[]): any => {
    if (!treeData || treeData?.length === 0) return []
    const { searchValue = '' } = store.filter

    const newTreeData = treeData
      .map((item) => {
        const title = item.title as string
        const index = title.indexOf(searchValue)
        const beforeStr = title.substr(0, index)
        const afterStr = title.substr(index + searchValue.length)

        const nodeTitle =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#0363FF ' }}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{item.title}</span>
          )
        if (item.children) {
          return {
            ...item,
            nodeTitle,
            children: filterTreeNode(item.children || []),
          }
        }

        return {
          ...item,
          nodeTitle,
        }
      })
      .filter(Boolean)

    return newTreeData
  }

  const isLiteSortCategoryAttributes = globalStore.isLite
    ? {
        draggable: { icon: false },
        // @ts-ignore
        allowDrop: ({ dropNode }) => {
          const { dropLevel, parentId } = store.sortCategory
          const {
            title: {
              props: {
                node: { level },
              },
            },
            key,
          } = dropNode
          let isAllowDrop = false
          // 拖拉元素为一级分类，禁止拖到二级分类区域禁用
          if (dropLevel === 1) {
            isAllowDrop = level === 1
          } else {
            // 拖拉元素为二级分类，仅在改子类的同级可用，其他禁用掉
            const keys =
              treeData
                .find((i) => i.key === parentId)
                ?.children?.map((f) => f.key) || []
            isAllowDrop = keys.includes(key)
          }
          return isAllowDrop
        },
        // @ts-ignore
        onDrop: (info) => {
          const { node, dragNode, dropPosition } = info
          const fromPos = dragNode.pos.split('-') as []
          const toPos = node.pos.split('-') as []
          if (dropPosition === +fromPos[fromPos.length - 1]) return
          store.applySortList(
            +fromPos[fromPos.length - 1],
            +toPos[toPos.length - 1],
            dropPosition,
          )
        },
        // 拖拽元素事件
        // @ts-ignore
        onDragStart: ({ event, node }) => {
          const {
            title: {
              props: {
                node: { level, parentId },
              },
            },
          } = node
          store.updateSortCategory('isDrop', true)
          store.updateSortCategory('dropLevel', level)
          store.updateSortCategory('parentId', parentId)
        },
        onDragEnd: () => {
          store.updateSortCategory('isDrop', false)
          store.updateSortCategory('dropLevel', -1)
          store.updateSortCategory('parentId', '0')
          store.applySortCategory() // 应用分类排序
        },
        // 拖拽容器事件
        // onDragOver: (info) => {},
        // onDragEnter: (info) => {},
        // onDragLeave: (info) => {},
      }
    : null

  return (
    // 这里的样式不要给太满，展开节点的时候会有抖动问题
    <div className='gm-site-card-border-less-wrapper-100'>
      <div className='category-tree-sum'>
        {t('分类总数：')}
        {treeData.length}
      </div>
      <Spin tip={t('加载中...')} spinning={store.loading}>
        <div style={treeTableStyle} className='category-tree-table'>
          <Tree
            onExpand={onExpand}
            blockNode
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            switcherIcon={
              <DownOutlined
                style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)' }}
              />
            }
            {...isLiteSortCategoryAttributes}
          >
            {renderTreeNode(filterTreeNode(treeData))}
          </Tree>
        </div>
      </Spin>

      <CreateSonCategory ref={modalRef} />
      <AddCategory ref={catagoryRef} />
    </div>
  )
}

export default observer(TreeTable)
