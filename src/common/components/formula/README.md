## formula 定价公式

### `<Calculator />`

公式输入组件，类似计算器，支持受控和非受控用法。

```tsx
import Calculator from '@/common/components/formula/calculator'

export default () => {
  return <Calculator /> // 受控方式需要自行处理 value、onChange
}
```

#### 工具函数

```ts
import { formatFormula, parseFormula } from '@/common/components/formula/calculator'

// 将公式格式化为可阅读的文字
formatFormula('{sale_price}*2') // 【现单价】×2



/**
 * 解析字符串公式
 *
 * 结果为：
 * [
 *   {
 *       "value": "{sale_price}",
 *       "content": "现单价",
 *       "textBoxValue": "【现单价】",
 *       "isVariable": true
 *   },
 *   {
 *       "content": "×",
 *       "textBoxValue": "×",
 *       "value": "*"
 *   },
 *   {
 *       "content": "2",
 *       "textBoxValue": "2",
 *       "value": "2"
 *   }
 * ]
 */
parseFormula('{sale_price}*2')
```



### history_formula_modal

历史公式弹窗，从中筛选并选择指定商品的公式。

- `<HistoryFormulaModal />`

  ```tsx
  export default () => {
    const [visible] = useState(true)

    return <HistoryFormulaModal visible />
  }
  ```

- `<HistoryFormula />` 自动管理弹窗 visible。

  ```tsx
  import {
    HistoryFormula,
    HistoryFormulaRef,
  } from '@/common/components/formula/history_formula_modal'

  export default () => {
    const instance = useRef<HistoryFormulaRef>(null)
    // instance.close() 手动控制弹窗关闭
    // instance.open() 手动控制弹窗显示

    return (
      <HistoryFormula ref={instance}>
        <button>点击打开弹窗</button>
      </HistoryFormula>
    )
  }
  ```

- calculator_with_history_formula
  公式输入组件，并且右侧包含一个“历史公式”按钮。
  支持受控和非受控用法。
  
  

### `<RangePrice />` 区间定价组件。

该组件不能单独使用，需要嵌套在 antd `<Form />` 组件中。
该组件已包含数据校验规则。

```tsx
import RangePrice from '@/common/components/formula/range_price'

export default () => {
  const [form] = Form.useForm()

  return (
    <Form form={form}>
      {/* 组件本身并不需要使用 Form.Item 嵌套 */}
      <RangePrice form={form} />

      {/* 但是如果你想要 Form.Item 的样式而必须嵌套，那么请不要设置 `name` */}
      <Form.Item labelCol={{ span: 24 }} label='区间定价'>
        <RangePrice fieldName='list' form={form} />
      </Form.Item>

      <Button htmlType='submit'>Submit</Button>
    </Form>
  )
}
```

#### RangePrice Props

| 参数            | 说明                | 类型                         | 默认值 |
| :-------------- | ------------------- | ---------------------------- | ------ |
| form     | 由 `antd Form.useForm` 创建的表单实例。<br/>由于组件内部需要使用实例进行校验，所以此项必传。        | `FormInstance`                    | 此项必填 |
| fieldName | 自定义该字段的 `name`。<br />作用与 `Form.Item` 的 name 一致。 | `string`           | "rangePriceList" |
| limit | 条数限制。最大可添加的区间价格条数。<br />默认只能添加 10 条。 | `number` | 10    |

#### 其他

如果你想要单独使用该组件，那么你可以查阅此组件文件夹中的 `range_price_form_item.tsx` 文件，它仅作为“区间定价”组件中数据录入角色，它不依赖 antd Form 组件，你可以将它理解为一个 input。
