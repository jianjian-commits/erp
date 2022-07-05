## `<SelectBasicUnit />`

选择基本下单单位 Select 组件，Options 已经过排序。

> 默认排序方式
> 重量单位 > 容积单位 > 长度单位 > 其他单位

### Props

| 参数        | 说明     | 类型          | 默认值                                                       |
| :---------- | -------- | ------------- | ------------------------------------------------------------ |
| orderByType | 排序规则 | `Unit_Type[]` | 默认以<br/> `重量单位 > 容积单位 > 长度单位 > 其他单位` 排序 |

此组件使用 antd Select 组件封装，支持 Select 所有 Props。但是 `children` 与 `options` 除外。

### 杂项

此组件依赖 globalStore.unitList

## `<SelectGroupingUnit />`

单位选择器，分组显示 Options。

此组件基于 antd Select 组件封装。
组件内不包含任何排序逻辑，仅作为 UI 展示，在使用时，应当将 Options 排好序之后传递给组件。

### Props

| 参数       | 说明                     | 类型             | 默认值 |
| :--------- | ------------------------ | ---------------- | ------ |
| options    | 单位数据                 | `OptionsShape`   | -      |
| fieldNames | 设置 options 对应 key 值 | `FieldNameShape` | -      |

```ts
interface OptionsShape {
  label: string
  value: string | number
  children: { label: string; value: string | number }[]
}

interface FieldNameShape {
  /** @default "label" */
  groupLabel?: string
  /** @default "label" */
  label?: string
  /** @default "value" */
  value?: string
  /** @default "children" */
  children?: string
}
```
