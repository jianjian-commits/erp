/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactNode, useState, useEffect, useRef, Key } from 'react'
import { Cascader, Divider } from 'antd'
import AddCategoryModal, { ModalRef } from './add_category_modal'
import { DataNode, DataOption } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { formatCascaderData } from '@/common/util'
import store from '../../store'

import globalStore from '@/stores/global'
import classNames from 'classnames'
import { Permission } from 'gm_api/src/enterprise'
interface CategoryCascaderProps {
  value?: Key[] | undefined
  onChange?: (value: Key[]) => void
  [propName: string]: any
  showAdd?: boolean
}

/**
 * @description 选择分类级联
 */
const CategoryCascader = (props: CategoryCascaderProps) => {
  const modalRef = useRef<ModalRef>(null)

  const { value, onChange, showAdd = true, ...rest } = props

  const { setCreateLoadingState } = store

  const [popupVisible, setPopupVisible] = useState(false)
  const [options, setOptions] = useState<DataOption[]>([])
  const [categoryTreeData, setCategoryTreeData] = useState<DataNode[]>([])
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: DataNode }>(
    {},
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(timeout)
  }, [])

  const fetchData = async (ids?: Key[]) => {
    const { categoryTreeData, lessLevelCategoryTreeData, categoryMap } =
      await fetchTreeData()
    if (ids && onChange) onChange(ids)
    if (globalStore.isLite) {
      setCategoryTreeData(
        _.filter(lessLevelCategoryTreeData, (item) => item.title !== '未分类'),
      )
    } else {
      setCategoryTreeData(lessLevelCategoryTreeData)
    }

    setOptions(formatCascaderData(categoryTreeData))
    setCategoryMap(categoryMap)
    setCreateLoadingState()
  }

  const onPopupVisibleChange = (value: boolean) => {
    setPopupVisible(value)
  }

  const dropdownRender = (node: ReactNode) => {
    return (
      <>
        {node}
        <Divider style={{ margin: 0 }} />
        <div style={{ padding: 8 }}>
          <a
            className={classNames({
              merchandise_a_disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY,
              ),
            })}
            onClick={() => {
              setPopupVisible(false)
              modalRef.current && modalRef.current.handleOpen()
            }}
          >
            + {t('新增商品分类')}
          </a>
        </div>
      </>
    )
  }

  return (
    <>
      <Cascader
        value={value}
        placeholder={t('请选择所属分类')}
        options={options}
        dropdownRender={showAdd ? dropdownRender : undefined}
        expandTrigger='hover'
        popupVisible={popupVisible}
        onChange={onChange}
        onPopupVisibleChange={onPopupVisibleChange}
        changeOnSelect
        showSearch
        {...rest}
      />
      <AddCategoryModal
        treeData={categoryTreeData}
        treeMap={categoryMap}
        ref={modalRef}
        fetchData={fetchData}
      />
    </>
  )
}

CategoryCascader.defaultProps = {
  onChange: _.noop,
}

export default CategoryCascader
