import { SelectedFields, AnyObject, ValueInObject } from '../interface'
import { SelectedFieldsRef } from '../panel/interface'

export type Methods<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> = Omit<SelectedFieldsRef<RawData, TabId, RawDataKey>, 'original'>

export interface PrivateFieldStateInstance<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> {
  /** 获取所有已选择的字段 */
  getFields: () => SelectedFields<RawData, TabId>[]
  /** 根据 tab id 获取已选择的字段 */
  getField: (tabId: TabId) => SelectedFields<RawData, TabId> | undefined
  /**
   * 重置 dirty 标记。
   *
   * 未提供 tab id 则表示重置所有。
   */
  resetDirty: (tabId?: TabId) => void
  /** 为指定 tab 设置字段勾选。 */
  setChecked: (tabId: TabId, key: RawDataKey | RawDataKey[]) => void
  /** 为指定 tab 取消字段勾选。 */
  removeChecked: (tabId: TabId, key: RawDataKey) => void
  /**
   * 清空已勾选字段
   *
   * 未提供 tab id 则表示清空所有。
   */
  clearChecked: (tabId?: TabId) => void
  /**
   * ========================================================
   *
   * **警告：不要操作此字段，该字段仅用于组件内部使用，不是向外暴露的公共 API**
   *
   * ========================================================
   */
  __PRIVATE_INTERNAL__: {
    setMethods: (
      tabId: TabId,
      methods: Methods<RawData, TabId, RawDataKey>,
    ) => void
    setField: (tabId: TabId, value: SelectedFields<RawData, TabId>) => void
    removeField: (tabId: TabId) => void
  }
}

/**
 * useFieldState 实例
 */
export type FieldStateInstance<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> = Omit<
  PrivateFieldStateInstance<RawData, TabId, RawDataKey>,
  '__PRIVATE_INTERNAL__'
>
