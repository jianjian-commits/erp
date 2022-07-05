import React, { ReactNode, useEffect, useContext, useMemo, FC } from 'react'
import { Row, Col, Form, Space, Cascader, Input, Select } from 'antd'
import { ComponentContext, DEFAULT_TREE_NAME_ENUM } from './constants'
import { VerticalRightOutlined, DownOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'
import { FilterBarProps } from './data'
import classNames from 'classnames'

const iconStyle = { color: '#5f5f5f', fontSize: '16px', marginLeft: '16px' }

const fieldNames = { label: 'title', value: 'key' }

const cascaderStyle = { width: '200px' }

const FilterBar: FC<FilterBarProps> = (props) => {
  const {
    extraRight,
    filterNode,
    filterOptions,
    treeData,
    form,
    onFilterChange,
    defaultAllClassifyTitle,
  } = props

  const { isExpandTree, setExpandTree, setSelectedKeys } =
    useContext(ComponentContext)

  useEffect(() => {
    form.setFieldsValue({ category_ids: [DEFAULT_TREE_NAME_ENUM.key] })
  }, [form])

  const onValuesChange = (changeValues: any, allValues: any) => {
    if (changeValues.category_ids) {
      setSelectedKeys([
        changeValues.category_ids[changeValues.category_ids.length - 1],
      ])
    }
    if (typeof onFilterChange === 'function')
      onFilterChange(changeValues, allValues)
  }

  /** 展开树 */
  const handleExpandTree = () => {
    setExpandTree(true)
  }
  /**
   * 树级联 - 固定商品分类
   */
  const dropdownRender = (node: ReactNode) => {
    return (
      <>
        <div className='category-cascader-fix' onClick={handleExpandTree}>
          <span className='category-cascader-fix-content'>
            {t(`固定${defaultAllClassifyTitle || '全部分类'}`)}
          </span>
          <VerticalRightOutlined
            rotate={-90}
            className='right-out-lined'
            style={iconStyle}
          />
        </div>
        {node}
      </>
    )
  }

  const options = useMemo(
    () => [
      {
        title: defaultAllClassifyTitle || DEFAULT_TREE_NAME_ENUM.name,
        key: DEFAULT_TREE_NAME_ENUM.key,
      },
      ...treeData,
    ],
    [treeData, defaultAllClassifyTitle],
  )

  return (
    <>
      <Row className='category-filter-frame'>
        <Col span={20}>
          {/* 筛选部分 */}
          <Form
            name='list_filter'
            layout='inline'
            form={form}
            onValuesChange={onValuesChange}
          >
            {/* 分类级联 */}
            <Form.Item
              name='category_ids'
              className={classNames({
                hide: isExpandTree,
              })}
            >
              <Cascader
                style={cascaderStyle}
                expandTrigger='hover'
                changeOnSelect
                allowClear={false}
                dropdownRender={dropdownRender}
                expandIcon={<DownOutlined rotate={-90} />}
                fieldNames={fieldNames}
                options={options}
                dropdownClassName='gm-cascader-wrap'
              />
            </Form.Item>
            {/* Filter部分支持传Node 和 配置项两种方式 TODO: filterOptions 待开发 */}

            {filterNode}
          </Form>
        </Col>
        <Col span={4}>
          {/* 顶部右侧按钮 */}
          <Row justify='end'>
            <Space size={16}>{extraRight}</Space>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default FilterBar
