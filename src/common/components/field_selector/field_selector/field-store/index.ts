import _ from 'lodash'
import { PrivateFieldStateInstance, Methods } from './interface'
import { SelectedFields, AnyObject, ValueInObject } from '../interface'

/**
 * 该 store 仅存储数据，不做任何与页面相关的操作
 */
class FieldStore<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> {
  /** 存储每个 tab 已勾选的字段 */
  private _fields = new Map<TabId, SelectedFields<RawData, TabId>>()

  private _setField(tabId: TabId, field: SelectedFields<RawData, TabId>) {
    this._fields.set(tabId, field)
  }

  private _getField(tabId: TabId) {
    return this._fields.get(tabId)
  }

  /** 存储每个 tab 组件向外暴露的函数 */
  private _tabMethods = new Map<TabId, Methods<RawData, TabId, RawDataKey>>()

  private _setTabMethods(
    tabId: TabId,
    methods: Methods<RawData, TabId, RawDataKey>,
  ) {
    this._tabMethods.set(tabId, methods)
  }

  private _getTabMethods(tabId: TabId) {
    const value = this._tabMethods.get(tabId)
    if (!value) {
      console.warn(`id 为 ${tabId} 的 tab 不存在`)
    }
    return value
  }

  constructor() {
    this._getField = this._getField.bind(this)
    this._setField = this._setField.bind(this)
    this._getTabMethods = this._getTabMethods.bind(this)
    this._setTabMethods = this._setTabMethods.bind(this)
    this.getInstance = this.getInstance.bind(this)
  }

  getInstance(): PrivateFieldStateInstance<RawData, TabId, RawDataKey> {
    return {
      getField: this._getField,
      getFields: () => {
        return Array.from(this._fields.values())
      },
      resetDirty: (tabId) => {
        if (_.isNil(tabId)) {
          this._tabMethods.forEach((method) => {
            method.resetDirty()
          })
          return
        }
        const target = this._getTabMethods(tabId)
        if (!target) return
        target.resetDirty()
      },
      setChecked: (tabId, key) => {
        const target = this._getTabMethods(tabId)
        if (!target) return
        target.setChecked(key)
      },
      removeChecked: (tabId, key) => {
        const target = this._getTabMethods(tabId)
        if (!target) return
        target.removeChecked(key)
      },
      clearChecked: (tabId) => {
        if (_.isNil(tabId)) {
          this._tabMethods.forEach((method) => {
            method.clearChecked()
          })
          return
        }
        const target = this._getTabMethods(tabId)
        if (!target) return
        target.clearChecked()
      },
      __PRIVATE_INTERNAL__: {
        setMethods: this._setTabMethods,
        setField: this._setField,
        removeField: (tabId) => {
          this._fields.delete(tabId)
        },
      },
    }
  }
}

export default FieldStore
