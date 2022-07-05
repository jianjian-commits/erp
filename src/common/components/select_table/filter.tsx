/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, {
  useContext,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Input, Select, Form, Cascader } from 'antd'
import { UiFilter } from './interface'
import { TableContext } from './constants'
import { t } from 'gm-i18n'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import DateRangePicker from './date_range_picker'

const formStyle = {
  marginBottom: '16px',
  marginTop: '16px',
}

interface FilterProps {
  filter: UiFilter[]
}

interface HocFormItemProps {
  ui: UiFilter
  initialValue?: unknown
  onFinish: (isResetCurrent?: boolean) => void
}

export interface FilterRef {
  onFinish(isResetCurrent?: boolean): void
}

const getElement = ({ ui, onFinish }: HocFormItemProps) => {
  const {
    type,
    placeholder,
    options,
    width,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialValue: _initialValue, // 过滤此 Props，避免向下传递
    ...res
  } = ui

  const onSearch = () => {
    onFinish(true)
  }
  let node: ReactNode

  const nodeProps = { placeholder, style: { width }, ...res }

  switch (type) {
    case 'input':
      node = (
        <Input.Search
          {...nodeProps}
          onSearch={onSearch}
          enterButton={t('搜索')}
        />
      )
      break
    case 'select':
      node = <Select {...nodeProps} options={options} onChange={onSearch} />
      break
    case 'cascader':
      node = (
        <Cascader
          {...nodeProps}
          options={options}
          onChange={onSearch}
          expandTrigger='hover'
          showSearch
        />
      )
      break
    case 'categoryCascader':
      node = <CategoryCascader onChange={onSearch} />
      break
    case 'gmDateRangePicker':
      // antd Form.Item 组件将会注入 value 值
      // @ts-ignore
      node = <DateRangePicker {...nodeProps} onChange={onSearch} />
      break
    default:
      node = <Input {...nodeProps} />
  }

  return node
}

const HocFormItem = (props: HocFormItemProps) => {
  const {
    initialValue,
    ui: { name, label },
  } = props
  return (
    <Form.Item key={name} name={name} label={label} initialValue={initialValue}>
      {getElement({ ...props })}
    </Form.Item>
  )
}

const Filter = forwardRef<FilterRef, FilterProps>((props, ref) => {
  const { filter } = props
  const { fetchList } = useContext(TableContext)

  const [form] = Form.useForm()

  const onFinish = (isResetCurrent?: boolean) => {
    const fieldsValue = form.getFieldsValue()
    fetchList(fieldsValue, isResetCurrent)
  }

  useImperativeHandle(ref, () => ({
    onFinish,
  }))

  return (
    <Form
      form={form}
      name='selece_table_filter'
      layout='inline'
      style={formStyle}
    >
      {filter.map((item) => (
        <HocFormItem
          key={item.name}
          initialValue={item.initialValue}
          ui={{ ...item }}
          onFinish={onFinish}
        />
      ))}
    </Form>
  )
})

export default Filter
