## 注：

> 绝大部分类型签名位于文档底部



## FieldSelector 字段选择组件

### FieldSelector Props

| 参数              | 说明                                                         | 类型                           | 默认值                                               |
| ----------------- | ------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------- |
| activeKey         | 当前被激活的 Tab 的名称                                      | string                         |                                                      |
| defaultActiveKey  | 默认激活的 Tab 名称                                          | String                         |                                                      |
| containerStyle    | 设置容器样式（将直接作用于左右两个元素）                     | `CSSProperties`                | `{ height: 460, maxHeight: 540, overflowY: 'auto' }` |
| fieldKey          | 数据源中唯一值，同时也是 React 需要的 key                    | string                         |                                                      |
| labelKey          | 数据源中表示 label 字段（给 Checkbox 使用）                  | string                         |                                                      |
| tabs              | Tab 页配置                                                   | `TabItem[]`                    |                                                      |
| instance          | 使用 `useFieldState` 创建的实例。                            | `FieldStateInstance`           |                                                      |
| onChangeActiveKey | 切换 Tab 时触发                                              | `(name: string) => void`       |                                                      |
| fetcher           | Tab 激活时，用于获取字段数据。<br />注意，该值将会在 useEffect 中调用，请尽可能让其不可变。 | `(params) => Promise `         |                                                      |
| batchSubmit       | 是否开启批量提交<br />批量提交时，onSubmit 将传递一个数组。  | `boolean`                      | `true`                                               |
| onBeforeDestroy   | 组件销毁时调用                                               | `(id) => void`                 | `true`                                               |
| renderGroupTitle  | 自定义渲染分组标题                                           | `(group: Fields) => ReactNode` |                                                      |



### fetcher 函数

在激活 tab 的时候，它会被调用，要求你返回需要展示的数据。

fetcher 入参类型：

```ts
interface FetcherParams<K> {
  /**
   * 当前 tab 的名称
   */
  name: string
  /**
   * 当前 tab 的 id
   */
  id: K
}
```

返回数据具有一定格式约束：

```ts
interface Fields<T> {
  /** 当前分组名称 */
  label: string
  /** 字段列表 */
  children: T[]
}

interface DataShape<T> {
  list: Fields<T>[]
  selected: T[]
}

{
  "list": [
    {
      "label": "分组名称",
      "children": [] // 后端所返回的数据（无类型要求）
    }
  ],
  "selected": [] // 已勾选的字段列表（无类型要求，但是要和 list.children 类型一致）
}
```



### useFieldState

此 hook 提供一些函数用于操作数据。

```ts
import { useFieldState, FieldSelector } from '@/common/components/field_selector'

export default () => {
  const [instance] = useFieldState()
  
  return (
    <FieldSelector instance={instance} />
  )
}
```

instance 会提供几个函数：

- `instance.getFields() `

  获取所有已选择的字段。

- `instance.getField(id)`
  
  需要提供 id 获取对应 tab 下已勾选的列表。
  
- `instance.resetDirty([id])`
  
  重置 dirty 标记。dirty 标记表示 tab 中的字段是否被操作过。
  未提供 id 则表示重置所有。
  
- `instance.setChecked(tabId, key)`
  
  为指定 tab 设置字段勾选。
  
- `instance.removeChecked(tabId, key)`
  
  为指定 tab 取消字段勾选。
  
- `instance.clearChecked([tabId])`
  
  清空勾选字段，未提供 tabId 则表示清空所有。
  
  


## FieldSelectorModal 字段选择组件弹窗

### FieldSelectorModal Props

此组件基于 `FieldSelector` 封装，支持它绝大部分 Props。

| 参数           | 说明                                                         | 类型                                               | 默认值                                               |
| -------------- | ------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| visible        | 控制弹窗展示                                                 | `boolean`                                          |                                                      |
| containerStyle | 设置容器样式（将直接作用于左右两个元素）                     | `CSSProperties`                                    | `{ height: 460, maxHeight: 540, overflowY: 'auto' }` |
| batchSubmit    | 是否开启批量提交<br />批量提交时，onSubmit 将传递一个数组。  | `boolean`                                          | `true`                                               |
| closeOnSubmit  | 提交后关闭弹窗                                               | `boolean`                                          | `true`                                               |
| onClose        | 关闭弹窗事件                                                 | `() => void`                                       |                                                      |
| onSubmit       | 点击底部“保存”按钮时触发。<br />返回 Promise 则自动显示 loading | `(fields: SelectedFields) => Promise<void> | void` |                                                      |



### FieldSelectorModal Demo

```tsx
import React, { useState } from 'react'
import {
  FieldSelectorModal,
  FetcherParams,
  SelectedFields,
  DataShape,
  useFieldState,
} from '@/common/components/field_selector'

const tabs = [
  { name: 'Tab 1', id: 1 },
  { name: 'Tab 2', id: 2 },
]

interface RawField {
  text: string
  uid: string
}

const fetcher = (
  params: FetcherParams<number>,
): Promise<DataShape<RawField>> => {
  console.log(params)

  return Promise.resolve({
    list: [
      {
        label: '分组 1',
        children: [
          { text: '苹果', uid: '1' },
          { text: '香蕉', uid: '2' },
          { text: '葡萄', uid: '3' },
          { text: '草莓', uid: '4' },
        ],
      },
      {
        label: '分组 2',
        children: [
          { text: 'AAA2', uid: 'A2' },
          { text: 'BBB2', uid: 'B2' },
        ],
      },
    ],
    selected: [
      { text: '香蕉', uid: '2' },
      { text: '葡萄', uid: '3' },
      { text: '草莓', uid: '4' },
    ],
  })
}

export default () => {
  const [visible, setVisible] = useState(true)

  // 以下为可选功能
  const [instance] = useFieldState()
  // 加上类型有助于更好的类型提示
  // const [instance] = useFieldState<RawField, number>()

  // instance.getField(1) 更具 tab 的 id 获取已选字段
  // instance.getFields() 获取所有已选字段
  // instance.resetDirty() 重置 isDirty 标记

  const onSubmit = (value: SelectedFields<RawField, number>) => {
    if (value.isDirty) {
      // 字段被操作过，需要进行一些处理
      // 此时返回 Promise，则会显示 loading
    }
  }

  return (
    <FieldSelectorModal
      instance={instance}
      visible={visible}
      onClose={() => setVisible(false)}
      width={1024}
      title='标题文字'
      tabs={tabs}
      fetcher={fetcher}
      fieldKey='uid' // 告知组件：数据中表示主键的键名。
      labelKey='text' // 告知组件：数据组表示 label 文字描述的键名。
      batchSubmit={false} // 关闭批量保存，则 onSubmit 只返回当前激活 tab 的已选字段
      onSubmit={onSubmit}
    />
  )
}
```

## 类型签名

### FieldStateInstance

```ts
interface FieldStateInstance<T, K> {
  /** 获取所有已选择的字段 */
  getFields: () => SelectedFields<T, K>[]
  /**
   * 根据 key 获取已选择的字段
   */
  getField: (id: K) => SelectedFields<T, K> | undefined
  /**
   * 重置 dirty 标记。
   *
   * 未提供 id 则表示重置所有。
   */
  resetDirty: (id?: K) => void
}
```

### TabItem

```ts
interface TabItem<K> {
  /**
   * tab 名称
   */
  name: string
  /**
   * tab id
   */
  id: K
}
```

### SelectedFields

```ts
interface SelectedFields<T, K> {
  /**
   * 当前字段是否被操作过
   */
  isDirty: boolean
  /**
   * 对应 tab 的 名称
   */
  name: string
  /**
   * 对应 tab 的 id
   */
  id: K
  /**
   * 已选择的字段列表
   */
  fields: T[]
}
```

