## 可拖动排序

### DraggableSort 组件

该组件自由程度较高，不做任何限制。

组件拖拽排序是使用 drag 事件 + DOM 操作实现。

#### DraggableSort Demo

```tsx
import { useState } from 'react'
import {
  DraggableSort,
  arrayMove,
} from '@/common/components/draggable_sort_list'

export default () => {
  const [list, setList] = useState([
    { key: 'apple', label: '苹果' },
    { key: 'banana', label: '香蕉' },
  ])

  return (
    <DraggableSort.Context
      activeClassName='tw-text-blue-500 tw-bg-blue-100'
      onSortEnd={(oldIndex, newIndex) => {
        setList((rawList) => arrayMove(oldIndex, newIndex, rawList))
      }}
    >
      {list.map((item, index) => (
        <DraggableSort key={item.key} index={index}>
          {item.label}
        </DraggableSort>
      ))}
    </DraggableSort.Context>
  )
}
```

#### DraggableSort.Context Props

| 参数            | 说明                 | 类型                                           | 默认值 |
| :-------------- | -------------------- | ---------------------------------------------- | ------ |
| activeClassName | 被拖拽元素高亮 class | `string`                                       |        |
| onSortEnd       | 排序结束后触发       | `(oldIndex: number, newIndex: number) => void` |        |

#### DraggableSort Props

| 参数  | 说明                         | 类型     | 默认值 |
| :---- | ---------------------------- | -------- | ------ |
| index | 当前条目所在数据中的索引位置 | `number` |        |

### DraggableSortList 可拖动排序列表

该组件由 `DraggableSort` 封装而来，有少许限制，自由程度较低。

#### DraggableSortList Demo

```tsx
import { useState } from 'react'
import { DraggableSortList } from '@/common/components/draggable_sort_list'

export default () => {
  const [list, setList] = useState([
    { key: 'apple', label: '苹果' },
    { key: 'banana', label: '香蕉' },
  ])

  return (
    <DraggableSortList
      fieldKey='key'
      labelKey='label'
      list={list}
      onSortEnd={setList}
      onRemove={(_key, index) => {
        setList((v) => {
          const res = v.slice()
          res.splice(index, 1)
          return res
        })
      }}
    />
  )
}
```

#### DraggableSortList Props

| 参数            | 说明                              | 类型                           | 默认值 |
| :-------------- | --------------------------------- | ------------------------------ | ------ |
| fieldKey        | 唯一值，同时也是 React 需要的 key | `string \| number \| symbol`   |        |
| labelKey        | label 字段                        | `string`                       |        |
| list            | 列表数据                          | `Array`                        |        |
| itemClassName   | 为列表每一项设置 class            | `string`                       |        |
| activeClassName | 被拖拽元素高亮 class              | `string`                       |        |
| onRemove        | 点击删除时触发                    | `(key, index: number) => void` |        |
| onSortEnd       | 排序结束后触发                    | `(list: Array) => void`        |        |
