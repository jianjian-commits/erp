/** 任意对象类型 */
export type AnyObject = Record<string, any>

/** 使用 object 中的值作为类型 */
export type ValueInObject<T> = T[keyof T]

/**
 * 接口返回的字段结构
 */
export interface Fields<RawData extends AnyObject> {
  /** 当前分组名称 */
  label: string
  /** 字段列表 */
  children: RawData[]
}

/**
 * onSubmit 参数、useFieldState 获取结果
 */
export interface SelectedFields<RawData extends AnyObject, TabId> {
  /** 当前 tab 的 id */
  id: TabId
  /** 当前 tab 名称 */
  name: string
  /** 当前字段是否被操作过 */
  isDirty: boolean
  /** 已选择的字段列表 */
  fields: RawData[]
}
