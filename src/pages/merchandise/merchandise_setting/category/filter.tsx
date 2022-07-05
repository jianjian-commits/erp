import React, { useRef } from 'react'
import { Form, Input, Button } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import AddCategory, { AddCategoryRef } from './components/create_category'
import store from './store'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const filterStyle = {
  padding: '16px 24px 16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
}

/** 分类管理筛选 */
const Filter = () => {
  const catagoryRef = useRef<AddCategoryRef>(null)
  const [form] = Form.useForm()

  /** 分类树查询 */
  const handleSearch = () => {
    const { searchValue } = form.getFieldsValue()

    /** 获取展开的Key值 */
    const expandedKeys = searchValue
      ? store.dataList
          .map((item) => {
            const title = item.title as string
            if (title.indexOf(searchValue) > -1) {
              return store.getParentKey(item.key, store.treeData)
            }
            return null
          })
          .filter((item, i, self) => item && self.indexOf(item) === i)
      : []
    store.setFilter({ searchValue })
    store.setAutoExpandParent(true)
    store.setExpandedKeys(expandedKeys)
  }

  /** 新建分类 */
  const handleCreate = () => {
    catagoryRef.current && catagoryRef.current.handleOpen()
  }

  return (
    <>
      <div style={filterStyle}>
        <Form form={form} layout='inline'>
          <Form.Item label='' name='searchValue'>
            <Input.Search
              placeholder={t('请输入分类名称')}
              style={{ minWidth: 120 }}
              enterButton={t('搜索')}
              onSearch={handleSearch}
            />
          </Form.Item>
        </Form>
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY}
        >
          <Button type='primary' onClick={handleCreate}>
            {t('新建分类')}
          </Button>
        </PermissionJudge>
      </div>
      <AddCategory ref={catagoryRef} />
    </>
  )
}

export default observer(Filter)
