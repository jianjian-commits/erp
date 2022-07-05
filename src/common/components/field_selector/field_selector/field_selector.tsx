import React, { ReactElement } from 'react'
import _ from 'lodash'
import { Tabs } from 'antd'
import Panel, { FieldSelectorPanelProps, SelectedFieldsRef } from './panel'
import {
  PrivateFieldStateInstance,
  FieldStateInstance,
} from './field-store/interface'
import useFieldState from './hooks/use_field_state'
import { AnyObject, ValueInObject } from './interface'

import './index.less'

const { TabPane } = Tabs

export interface TabItem<TabId> {
  /**
   * tab id
   *
   * 虽然此处要求传递 id，但是这个 id 仅仅作为 tab 的唯一标识，
   * tab 激活所使用的是 name。
   */
  id: TabId
  name: string
}

export interface FieldSelectorProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> extends Omit<
    FieldSelectorPanelProps<RawData, TabId, RawDataKey>,
    'name' | 'id' | 'instanceRef'
  > {
  activeKey?: TabItem<TabId>['name']
  defaultActiveKey?: TabItem<TabId>['name']
  tabs?: TabItem<TabId>[]
  instance?: FieldStateInstance<RawData, TabId, RawDataKey>
  onChangeActiveKey?: (key: TabItem<TabId>['name']) => void
}

/**
 * 字段选择组件，左右结构
 * 左侧为可选字段 Checkbox，右侧为已选列表
 */
function FieldSelector<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
>(props: FieldSelectorProps<RawData, TabId, RawDataKey>): ReactElement {
  const {
    tabs,
    activeKey,
    defaultActiveKey,
    instance,
    onChangeActiveKey,
    ...restProps
  } = props

  const [fieldState] = useFieldState<RawData, TabId, RawDataKey>(instance) as [
    PrivateFieldStateInstance<RawData, TabId, RawDataKey>,
  ]
  const { setField, setMethods } = fieldState.__PRIVATE_INTERNAL__

  const setRef = (
    fieldRef: SelectedFieldsRef<RawData, TabId, RawDataKey> | null,
  ) => {
    if (fieldRef) {
      const { original, ...rest } = fieldRef
      setField(fieldRef.original.id, fieldRef.original)
      setMethods(original.id, rest)
    }
  }

  return (
    <Tabs
      className='field-selector'
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      size='small'
      type='card'
      onChange={onChangeActiveKey}
    >
      {_.map(tabs, (item) => {
        return (
          <TabPane tab={item.name} key={item.name}>
            <Panel
              {...restProps}
              instanceRef={setRef}
              id={item.id}
              name={item.name}
              // onBeforeDestroy={removeField}
            />
          </TabPane>
        )
      })}
    </Tabs>
  )
}

export default FieldSelector
