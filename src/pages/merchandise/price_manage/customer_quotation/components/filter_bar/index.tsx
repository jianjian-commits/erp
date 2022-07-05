/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { ReactNode, forwardRef, useImperativeHandle } from 'react'
import { Input, Select, Form, Cascader } from 'antd'
import { t } from 'gm-i18n'
import './style.less'

export type Options = {
  label: ReactNode
  value: string | number
}

export interface UiFilter {
  name: string
  label?: ReactNode
  placeholder?: string
  /** 输入框类型 */
  type: 'input' | 'select' | 'cascader'
  width?: string | number
  options?: Options[]
  [key: string]: any
}

interface FilterProps {
  filter: UiFilter[]
  extraRight: ReactNode
  fetchList: (params: any) => void
  [key: string]: any
}

interface HocFormItemProps {
  ui: UiFilter
  onFinish: () => void
}

export interface FilterRef {
  onFinish(): void
}

const getElement = ({ ui, onFinish }: HocFormItemProps) => {
  const { label, name, type, placeholder, options, width, ...res } = ui

  const onSearch = () => {
    onFinish()
  }
  let node: ReactNode

  const nodeProps = { placeholder, style: { width }, ...res }

  switch (type) {
    case 'input':
      node = (
        <Input.Search
          {...nodeProps}
          onSearch={onSearch}
          allowClear
          enterButton={t('搜索')}
        />
      )
      break

    case 'select':
      node = (
        <Select
          {...nodeProps}
          options={options}
          onSelect={onSearch}
          allowClear
        />
      )
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
  const { filter, fetchList, extraRight, style, ...resProps } = props

  const [form] = Form.useForm()

  const onFinish = () => {
    const fieldsValue = form.getFieldsValue()
    fetchList(fieldsValue)
  }

  useImperativeHandle(ref, () => ({
    onFinish,
  }))

  return (
    <div className='gm-table-filter-bar' style={style}>
      <Form
        form={form}
        name='selece_table_filter'
        onFinish={onFinish}
        layout='inline'
        className='gm-fitler-bar-form'
        {...resProps}
      >
        {filter.map((item) => (
          <HocFormItem key={item.name} ui={{ ...item }} onFinish={onFinish} />
        ))}
      </Form>
      {extraRight && (
        <div className='gm-filter-bar-extra-right'>{extraRight}</div>
      )}
    </div>
  )
})

export default Filter
