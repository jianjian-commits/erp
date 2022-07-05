import { ReactNode, Key } from 'react'
import { DataNode, DataNodeMap } from '@/common/interface'
import { FormInstance } from 'antd'

export type Options = {
  label: ReactNode
  value: string | number
}

export interface UiFilter {
  name: string
  label?: ReactNode
  placeholder?: string
  /** 输入框类型 */
  type: 'input' | 'select' | 'cascader' | 'categoryCascader'
  width?: string | number
  options?: Options[]
  [key: string]: any
}

export interface BaseProps {
  /** TreeData 树的数据 */
  treeData: DataNode[]
  form: FormInstance
  /** Filter 数据修改时触发 */
  onFilterChange(changeValue: any, allValue?: any): void
  /** 默认所有分类title */
  defaultAllClassifyTitle?: string
}

export interface TreeTableProps extends BaseProps {
  /** Table Node */
  table: ReactNode
}

export interface FilterBarProps extends BaseProps {
  /** Filter 右侧操作列 */
  extraRight?: ReactNode
  /** filterNode 和 filterOptions 配置 互斥 , 同时存在时 filterNode优先级更高 */
  filterNode?: ReactNode
  /** filterOptions 配置 和 filterNode 互斥 , 同时存在时 filterNode优先级更高 */
  filterOptions?: UiFilter[]
}

export interface CatagoryFilterTreeContext {
  /** 是否展开树 */
  isExpandTree: boolean
  /** 设置是否展开树 */
  setExpandTree(value: boolean): void
  selectedKeys: Key[]
  setSelectedKeys(value: Key[]): void
  treeDataMap: DataNodeMap
}

export interface CategoryFilterTreeProps
  extends Omit<FilterBarProps, 'form'>,
    Omit<TreeTableProps, 'form'> {}
