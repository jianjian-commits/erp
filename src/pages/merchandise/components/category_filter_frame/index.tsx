/**
 * @description 商品列表-页面框架 + 分类筛选，主要处理分类树与分类级联之间的状态交互
 */
import React, { FC, useState, useEffect, ReactNode, Key } from 'react'
import { observer } from 'mobx-react'
import { Row, Col, Form, Space, Tree, Cascader, Tooltip, FormProps } from 'antd'
import { VerticalRightOutlined, DownOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { CascaderValueType } from 'antd/lib/cascader'
import { t } from 'gm-i18n'
import { DataNode, DataOption } from '@/common/interface'
import { formatCascaderData } from '@/common/util'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import './style.less'

interface CategoryFilterFrameProps {
  /** 筛选内容 */
  filterItem?: ReactNode
  /** 右侧按钮 */
  extraRight?: ReactNode
  /** 列表部分 */
  table: ReactNode
  /** antd form方法 */
  formProps?: FormProps
  /** 商品树数据变化 */
  onTreeValueChange: (value: Key[]) => void
  /** 分类数据 */
  categoryTreeData: DataNode[]
  /** 分类对象，用于遍历级联选择器取值 */
  categoryMap: { [key: string]: DataNode }
}

const CategoryFilterFrame: FC<CategoryFilterFrameProps> = observer((props) => {
  const {
    filterItem,
    extraRight,
    table,
    formProps,
    categoryTreeData,
    onTreeValueChange,
    categoryMap,
  } = props

  /** 商品分类树展示状态 */
  const [isTree, setIsTree] = useState<boolean>(false)
  /** 级联选择器取值 */
  const [cascaderValue, setCascaderValue] = useState<Key[]>(['00'])
  /** 类型树取值 */
  const [treeValue, setTreeValue] = useState<Key[]>(['00'])
  /** 类型树展开节点 */
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(['00'])
  /** 类型树展示值 */
  const [select, setSelect] = useState<string>('全部分类')
  /** 商品分类级联选择器数据 */
  const [cascaderOptions, setCascaderOptions] = useState<DataOption[]>([])

  useEffect(() => {
    setCascaderOptions([
      {
        label: '全部分类',
        value: '00',
      },
      ...formatCascaderData(categoryTreeData),
    ])
  }, [categoryTreeData])

  useEffect(() => {
    if (isTree) {
      getTreeValue()
    } else {
      getCascaderValue()
    }
  }, [isTree])

  const setTreeState = (value: boolean) => {
    setIsTree(value)
  }

  /** 分类树节点选择事件 */
  const onTreeNodeSelect = (selectedKeys: Key[], e: any) => {
    const node = e.selectedNodes[0]
    const { ids } = getCategoryValue([], [...selectedKeys], categoryMap)
    onTreeValueChange(ids)
    setTreeValue(selectedKeys)
    setSelect(node.title)
  }

  /** 分类级联选择事件 */
  const onCascaderChange = (value: CascaderValueType) => {
    // 分类级联取值
    setCascaderValue(value)
  }

  /** 获取分类树取值 */
  const getTreeValue = () => {
    // 分类树取值
    const selectedValue = cascaderValue[cascaderValue.length - 1]
    setTreeValue([selectedValue])

    // 分类树应展开节点
    setExpandedKeys(cascaderValue)

    // 分类树顶部展示文本
    const seletedItem = categoryMap[selectedValue]
    const label = seletedItem?.title ? seletedItem.title.toString() : '全部分类'
    setSelect(label)
  }

  /** 分类树展开事件 */
  const onTreeExpand = (keys: Key[]) => {
    setExpandedKeys(keys)
  }

  /** 获取级联选择器取值 */
  const getCascaderValue = () => {
    const { ids } = getCategoryValue([], [...treeValue], categoryMap)
    setCascaderValue(ids)
  }

  const dropdownRender = (node: ReactNode) => {
    return (
      <>
        <div
          className='category-cascader-fix'
          onClick={() => setTreeState(true)}
        >
          <span className='category-cascader-fix-content'>
            {t('固定商品分类')}
          </span>
          <VerticalRightOutlined
            rotate={-90}
            className='right-out-lined'
            style={{ color: '#5f5f5f', fontSize: '16px', marginLeft: '16px' }}
          />
        </div>
        {node}
      </>
    )
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

  return (
    <>
      <Row className='category-filter-frame'>
        <Col span={18}>
          {/* 筛选部分 */}
          <Form name='list_filter' layout='inline' {...formProps}>
            <Space size={16}>
              {/* 分类级联 */}
              {!isTree && (
                <Form.Item name='category_ids' className='category-animation'>
                  <Cascader
                    style={{ width: '200px', marginRight: 0 }}
                    expandTrigger='hover'
                    changeOnSelect
                    allowClear={false}
                    dropdownRender={dropdownRender}
                    expandIcon={<DownOutlined rotate={-90} />}
                    options={cascaderOptions}
                    value={cascaderValue}
                    onChange={onCascaderChange}
                    dropdownClassName='gm-cascader-wrap'
                  />
                </Form.Item>
              )}
              {filterItem}
            </Space>
          </Form>
        </Col>
        <Col span={4} offset={2}>
          {/* 顶部右侧按钮 */}
          <Row justify='end'>
            <Space size={16}>{extraRight}</Space>
          </Row>
        </Col>
      </Row>
      <Row className='gm-site-card-border-less-wrapper-106'>
        {/* 分类树 */}
        <Col
          className={classNames('category-tree', {
            hide: !isTree,
          })}
        >
          <Row
            justify='space-between'
            align='middle'
            className='category-tree-select'
          >
            {t(select).length > 10 ? (
              <Tooltip title={t(select)}>
                <span className='category-tree-select-content'>
                  {`${t(select).substring(0, 10)}...`}
                </span>
              </Tooltip>
            ) : (
              <span className='category-tree-select-content'>{t(select)}</span>
            )}

            <a
              onClick={() => {
                setTreeState(false)
              }}
            >
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
                value: '00',
                title: '全部分类',
                key: '00',
                parentId: '',
              },

              ...categoryTreeData,
            ]}
            onSelect={onTreeNodeSelect}
            selectedKeys={treeValue}
            expandedKeys={expandedKeys}
            onExpand={onTreeExpand}
            switcherIcon={<DownOutlined />}
            titleRender={handleTitleRender}
            blockNode
          />
        </Col>
        <Col
          className={classNames('category-table', {
            'mini-table': isTree,
          })}
        >
          {/* 列表 */}
          {table}
        </Col>
      </Row>
    </>
  )
})

export default CategoryFilterFrame
