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
import CategoryCascader from './category_cascader'

const formStyle = {
  marginBottom: '16px',
  marginTop: '16px',
}

interface FilterProps {
  filter: UiFilter[]
}

interface HocFormItemProps {
  ui: UiFilter
  onFinish: (isResetCurrent?: boolean) => void
}

export interface FilterRef {
  onFinish(isResetCurrent?: boolean): void
}

const getElement = ({ ui, onFinish }: HocFormItemProps) => {
  const { type, placeholder, options, width, ...res } = ui

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
    default:
      node = <Input {...nodeProps} />
  }

  return node
}

const HocFormItem = (props: HocFormItemProps) => {
  const {
    ui: { name, label },
  } = props
  return (
    <Form.Item key={name} name={name} label={label}>
      {getElement({ ...props })}
    </Form.Item>
  )
}

const Filter = forwardRef<FilterRef, FilterProps>((props, ref) => {
  const { filter } = props
  const { fetchList } = useContext(TableContext)

  const [form] = Form.useForm()

  const onFinish = (isResetCurrent?: boolean) => {
    const fieldsValue = form.getFieldsValue(true)
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
        <HocFormItem key={item.name} ui={{ ...item }} onFinish={onFinish} />
      ))}
    </Form>
  )
})

export default Filter
