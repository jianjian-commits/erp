import { DataNode, DataNodeMap } from '@/common/interface'
import { ReactNode } from 'react'

export interface TreeTableProps
  extends Pick<TreeTitleProps, 'treeExtraActions'> {
  /** 树形数据 */
  treeData: DataNode[]
  /** 加载中的loading */
  loading?: boolean
  title: ReactNode
}

export interface TreeTitleProps {
  /** 图标 */
  icon?: ReactNode
  /** current Node */
  node: DataNode

  treeDataMap: DataNodeMap

  /** 树右侧操作栏目，传数组，数组下标和树的层级对应 */
  treeExtraActions?: ReactNode[]
  /** edit node func */
  //   handleEdit: (node: DataNode) => void
  //   /** create node func */
  //   handleCreate: (node: DataNode) => void
  //   /** delete node func */
  //   handleDelete: (id: string) => void
}
