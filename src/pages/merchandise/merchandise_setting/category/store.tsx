import { makeAutoObservable, toJS } from 'mobx'
import { Key } from 'react'
import { fetchTreeData } from './service'
import { DataNode, DataNodeMap } from '@/common/interface'
import {
  ListCategoryImage,
  CategoryImage,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  ReqCreateCategory,
  Category,
  UpdateManyCategory,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

export type FilterType = {
  searchValue: string
}

export interface GoUpProps {
  key: string
  level: number
  parentId: string
}

interface SortCategoryProps {
  list: Category[]
  dropLevel: number
  isDrop: boolean
  parentId: string
}

class ListStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.filter = {
      searchValue: '',
    }
    this.treeData = []
    this.treeDataMap = {}
    this.expandedKeys = []
    this.autoExpandParent = false
    this.dataList = []
    this.loading = false
  }

  /** 树展开的节点 */
  expandedKeys: Key[] = []

  /** 是否展开所有父节点 */
  autoExpandParent = false

  /** 分类树的数据 */
  treeData: DataNode[] = []

  /** 分类树的Map */
  treeDataMap: { [key: string]: Category } = {}

  /** 分类树的平级结构 */
  dataList: DataNode[] = []

  /** 图标List */
  iconList: CategoryImage[] = []

  /** 树的loading状态 */
  loading = false

  /** 筛选框的值 */
  filter: FilterType = {
    searchValue: '',
  }

  /** 排序相关数据 */
  sortCategory: SortCategoryProps = {
    list: [],
    dropLevel: -1,
    isDrop: false,
    parentId: '0',
  }

  updateSortCategory<T extends keyof SortCategoryProps>(
    key: T,
    value: SortCategoryProps[T],
  ) {
    this.sortCategory[key] = value
  }

  setFilter(filter: FilterType) {
    this.filter = { ...this.filter, ...filter }
  }

  setExpandedKeys(keys: Key[]) {
    this.expandedKeys = keys
  }

  setAutoExpandParent(value: boolean) {
    this.autoExpandParent = value
  }

  /** 获取分类树的方法 */
  async getTreeData() {
    this.loading = true
    const { treeData, treeDataMap } = await fetchTreeData()
    this.treeDataMap = treeDataMap
    this.loading = false
    this.generateList(treeData)
    this.treeData = treeData
  }

  /** 生成平级树形结构 */
  generateList = (data: DataNode[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      this.dataList.push({ ...node })
      if (node.children) {
        this.generateList(node.children)
      }
    }
  }

  /** 获取父节点Id */
  getParentKey = (key: Key, tree: DataNode[]): any => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }

  /** 获取分类图标 */
  getIconList() {
    return ListCategoryImage().then((json) => {
      const { images } = json.response
      this.iconList = images
    })
  }

  handleDeleteCategory(category_id: string) {
    return DeleteCategory({ category_id })
  }

  /** 新建一级分类 */
  handleCreateCategory(params: ReqCreateCategory) {
    return CreateCategory({ category: params })
  }

  /** 编辑一级分类 */
  handleUpdateCategory(params: Category) {
    return UpdateCategory({ category: params })
  }

  /** 轻巧版分类排序，排序根据 Category.rank */
  async applySortCategory() {
    const { list, isDrop } = this.sortCategory
    if (isDrop || !list.length) return
    await UpdateManyCategory({
      category_list: list || [],
    })
    await this.getTreeData()
  }

  /**
   *
   * @param from 被拖拉元素的index
   * @param to   放置的地方坐标
   * @param level 拖拽的层级
   */
  applySortList(from: number, to: number, dropPosition: number) {
    const { dropLevel, parentId } = this.sortCategory
    let l: Category[] = []
    // 拖拉元素为一级分类
    if (dropLevel === 1) {
      l = _.map(this.treeData, (it) => it.origins) || []
    } else {
      // 拖拉元素为二级分类
      l =
        _.find(this.treeData, (i) => i.key === parentId)?.children?.map(
          (f) => f.origins,
        ) || []
    }
    const s = this.insertArrOfIndex(l, from, to, dropPosition)
    this.updateSortCategory('list', s)
  }

  /**
   * 置顶
   * @param key
   */
  upGo({ key, level, parentId }: GoUpProps) {
    console.warn('level', key, level, parentId)
    let l: Category[] = []
    let index = -1
    // 一级分类置顶
    if (level === 1) {
      // @ts-ignore
      l =
        _.map(this.treeData, (it) => it.origins).sort(
          (a: Category, b: Category) => a.rank! - b.rank!,
        ) || []

      index = _.findIndex(this.treeData, (f) => f.key === key)
    } else {
      // 二级分类置顶
      l =
        this.treeData
          .find((i) => i.key === parentId)
          ?.children?.map((f) => f.origins) || []
      index = _.findIndex(l, (f) => f.category_id === key)
    }

    if (index !== 0) {
      l.unshift(l.splice(index, 1)[0])
    } else {
      l.push(l.shift() as Category)
    }
    const s = l.map((f, i) => {
      return {
        ...f,
        rank: i,
      }
    })
    this.updateSortCategory('list', s)
    this.applySortCategory()
  }

  /**
   * @param arr
   * @param indexX 拖拉的元素下标
   * @param indexY 目标元素的下标
   * @returns 交换元素位置 （暂时没有用到）
   */
  swapArrOfIndex<T>(arr: T[], indexX: number, indexY: number) {
    arr[indexX] = arr.splice(indexY, 1, arr[indexX])[0]
    return arr.map((f, i) => {
      return {
        ...f,
        rank: i,
      }
    })
  }

  /**
   *
   * @param arr
   * @param from
   * @param to
   * @returns 插入元素，往后排列
   */
  insertArrOfIndex<T>(
    arr: T[],
    from: number,
    to: number,
    dropPosition: number,
  ) {
    let t
    if (from > to) {
      if (to === 0 && dropPosition === -1) {
        t = to
      } else {
        t = to + 1
      }
    } else {
      t = to
    }
    arr.splice(t, 0, arr.splice(from, 1)[0])
    return arr.map((f, i) => {
      return {
        ...f,
        rank: i,
      }
    })
  }
}

export default new ListStore()
