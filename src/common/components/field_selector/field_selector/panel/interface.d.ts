import { SelectedFields, AnyObject, ValueInObject } from '../interface'
import { DataShape } from '../hooks/use_fetcher'

export interface FetcherParams<TabId> {
  /** 当前 tab id */
  id: TabId
  /** 当前 tab 名称 */
  name: string
}

export type FetcherFn<RawData extends AnyObject, TabId> = (
  params: FetcherParams<TabId>,
) => Promise<DataShape<RawData>>

export interface SelectedFieldsRef<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> {
  /** 已选字段数据 */
  original: SelectedFields<RawData, TabId>
  /** 重置 dirty 标记 */
  resetDirty: () => void
  /** 根据 key 勾选字段 */
  setChecked: (key: RawDataKey | RawDataKey[]) => void
  /** 根据 key 删除已勾选字段 */
  removeChecked: (key: RawDataKey) => void
  /** 清空已勾选字段 */
  clearChecked: () => void
}
