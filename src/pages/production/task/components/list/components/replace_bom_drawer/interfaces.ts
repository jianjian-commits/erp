import { ColumnType } from 'antd/lib/table'
import { Sku } from 'gm_api/src/merchandise'
import {
  ReplaceTaskBomMaterialRequest_ReplaceMaterial,
  ReplaceTaskBomMaterialRequest_ReplaceMaterials,
  Task,
  TaskDetail,
  TaskInput,
  Task_Type,
} from 'gm_api/src/production'
import { GetUnitType } from './../../../../../interface'

/**
 * 分类后的商品信息
 */
interface CategorizedSku {
  /**
   * 商品分类信息
   * key为类别的ID，格式为 一级分类,二级分类,三级分类
   * value为给分类下的商品，格式见下方
   */
  [id: string]: {
    /** 分类名称，格式为 一级分类/二级分类/三级分类 */
    name: string
    /** 商品信息 */
    skus: Sku[]
  }
}

/**
 * 基于antd Table中的ColumnType扩展的栏
 */
interface ExpandedColumnType<T> extends ColumnType<T> {
  /** 表格对应任务（计划）的类型 */
  type?: Task_Type
}

/**
 * 基于后端Task扩展的任务（计划）
 */
interface ExpandedTask extends Task {
  /** 任务（计划）的编号 */
  taskIndex: number
  /** 物料在任务（计划）中的编号 */
  inputIndex: number
  /** 任务（计划）的投料 */
  input?: TaskInput
  /** 当前任务（计划）需要跨的行数 */
  rowSpan?: number
  /** 分类后的物料列表，用于缓存搜索的物料 */
  skuList?: CategorizedSku
  /** 单位信息，用于展示规格 */
  unitInfo?: GetUnitType
  /** 替换的物料信息，用于替换物料的展示 */
  replaceInfo?: ReplaceMaterial
}

/**
 * 基于后端TaskDetail扩展的任务（计划）详情
 */
interface ExpandedTaskDetail extends TaskDetail {
  /** 当前的任务（计划）信息 */
  task: ExpandedTask
}

/**
 * 基于后端ReplaceTaskBomMaterialRequest中的ReplaceMaterial扩展的替换物料的属性
 */
interface ReplaceMaterial
  extends ReplaceTaskBomMaterialRequest_ReplaceMaterial {
  /** 基本单位ID */
  baseUnitId?: string
  /** 生产单位ID */
  productionUnitId?: string
}

/**
 * 替换物料的集合，与后端ReplaceTaskBomMaterialRequest中的ReplaceMaterials完全相同，只是为了简化名字，与上面的相匹配
 */
type ReplaceMaterials = ReplaceTaskBomMaterialRequest_ReplaceMaterials

export type {
  CategorizedSku,
  ExpandedColumnType,
  ExpandedTask,
  ExpandedTaskDetail,
  ReplaceMaterial,
  ReplaceMaterials,
}
