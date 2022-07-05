/*
 * @Description:新版分类筛选
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useMount } from 'react-use'
import { fetchTreeData } from '@/common/service'
import { Cascader, CascaderProps } from 'antd'
import { formatCascaderData } from '@/common/util'
import { DataNode, DataOption } from '@/common/interface'

interface CategoryFilterProps
  extends Omit<
    CascaderProps<string>,
    'value' | 'onChange' | 'options' | 'defaultValue'
  > {
  value?: string[]
  onChange?(categoryId?: string): void
  multiple?: false
  /** 单向的默认值传字符串 */
  defaultValue?: string
  /** 获取某一层级的分类数据 */
  level?: 1 | 2 | 3
}

interface CategoryFilterWithMultipleProps
  extends Omit<CategoryFilterProps, 'onChange' | 'multiple' | 'defaultValue'> {
  onChange?(categoryIds?: string[]): void
  multiple: true
  /** 多选的传string[] */
  defaultValue?: string[]
}

export function CategoryFilter(props: CategoryFilterProps): JSX.Element

export function CategoryFilter(
  props: CategoryFilterWithMultipleProps,
): JSX.Element

export function CategoryFilter({
  onChange,
  defaultValue,
  multiple,
  level,
  ...res
}: CategoryFilterProps | CategoryFilterWithMultipleProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  defaultValue = useMemo(() => defaultValue, [defaultValue?.length])
  const [list, setList] = useState<DataOption[]>([])
  const [innerValue, setInnerValue] = useState<string[] | undefined>([])
  useMount(() => {
    fetchTreeData().then((list) => {
      setDefaultValue(list.categoryMap)
      if (level) {
        setList(formatCascaderData(list.getTreeListByLevel(level)))
        return
      }
      setList(formatCascaderData(list.categoryTreeData))
    })
  })

  useEffect(() => {
    if (defaultValue?.length === 0 || defaultValue === '') {
      setInnerValue([])
    }
  }, [defaultValue?.length])
  /**
   * @description 如果有默认值，那么通过defaultValue处理成组件需要的value
   */
  const setDefaultValue = (categoryMap: Record<string, DataNode>) => {
    if (defaultValue) {
      // 如果有默认值
      let newValues = []
      if (multiple) {
        // 如果是多选
        for (const id of defaultValue) {
          // 如defaultValue为[1, 222, 33]，那么找到22的parentid：2和333的的parentId：3, 33
          const item = [id]
          newValues.push(item)
          let parentId = categoryMap[id as string].parentId as string
          while (parentId !== '0') {
            item.unshift(parentId)
            parentId = categoryMap[parentId].parentId as string
          }
        }
        // 上面处理完后，newValues为[[1], [2, 22], [3, 33, 333]]
      } else {
        // 如果不是多选，那么数组就一个id
        newValues = [defaultValue]
      }
      setInnerValue(newValues as string[])
    }
  }
  const onInnerChange = (category_ids?: string[]) => {
    const newCategoryIds = category_ids
    setInnerValue(category_ids)
    if (onChange) {
      if (multiple) {
        const newCategoryIds = category_ids as unknown as string[][]
        // 多谢的数组初始是类似[[1], [2, 22], [3, 33, 333]]的格式，
        // 取最后一个回调回去就好，而不是拿到再处理一遍
        const CategoryIds =
          newCategoryIds &&
          newCategoryIds?.reduce((pre, cur) => {
            pre.push(cur[cur?.length - 1])
            return pre
          }, [] as string[])
        onChange(CategoryIds)
      } else {
        onChange(
          newCategoryIds
            ? (newCategoryIds as string[])[newCategoryIds.length - 1]
            : undefined,
        )
      }
    }
  }

  return (
    <Cascader
      options={list}
      changeOnSelect
      expandTrigger='hover'
      // @ts-ignore
      onChange={onInnerChange}
      multiple={multiple}
      value={innerValue}
      {...res}
    />
  )
}

export default CategoryFilter
