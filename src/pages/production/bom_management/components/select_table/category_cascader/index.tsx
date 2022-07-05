/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Key } from 'react'
import { Cascader } from 'antd'
import { DataOption } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { formatCascaderData } from '@/common/util'
interface CategoryCascaderProps {
  value?: Key[] | undefined
  onChange?: (value: Key[]) => void
  [propName: string]: any
}

/**
 * @description 选择分类级联
 */
const CategoryCascader = (props: CategoryCascaderProps) => {
  const { value, onChange, ...rest } = props

  const [popupVisible, setPopupVisible] = useState(false)
  const [options, setOptions] = useState<DataOption[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (ids?: Key[]) => {
    const { categoryTreeData } = await fetchTreeData()
    if (ids && onChange) onChange(ids)
    setOptions(formatCascaderData(categoryTreeData))
  }

  const onPopupVisibleChange = (value: boolean) => {
    setPopupVisible(value)
  }

  return (
    <>
      <Cascader
        value={value}
        placeholder={t('请选择所属分类')}
        options={options}
        expandTrigger='hover'
        popupVisible={popupVisible}
        onChange={onChange}
        onPopupVisibleChange={onPopupVisibleChange}
        changeOnSelect
        showSearch
        {...rest}
      />
    </>
  )
}

CategoryCascader.defaultProps = {
  onChange: _.noop,
}

export default CategoryCascader
