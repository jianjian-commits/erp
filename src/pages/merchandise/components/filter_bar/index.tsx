/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, {
  useState,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Form, Row, Col, Space } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import './style.less'
import { valueType } from 'antd/lib/statistic/utils'
import FormItem from '@/pages/merchandise/manage/merchandise_list/component/form_item'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import { FieldData } from 'rc-field-form/lib/interface'
import item from '@gm-pc/react/src/component/tree/item'
import { isFieldName } from '@/pages/merchandise/manage/merchandise_list/create/util'

export type Options = {
  label: ReactNode
  value: string | number
}

// export interface UiFilter {
//   name: string
//   label?: ReactNode
//   placeholder?: string
//   /** 输入框类型 */
//   type: 'input' | 'select' | 'cascader'
//   width?: string | number
//   options?: Options[]
//   [key: string]: any
// }

interface FilterProps {
  filter: FormItemInterface<valueType>[]
  extraRight: ReactNode
  fetchList: (params: any) => void
  [key: string]: any
}

// interface HocFormItemProps {
//   ui: UiFilter
//   onFinish: () => void
// }

export interface FilterRef {
  onFinish(): void
}

// const getElement = ({ ui, onFinish }: HocFormItemProps) => {
//   const { label, name, type, placeholder, options, width, ...res } = ui

//   const onSearch = () => {
//     onFinish()
//   }
//   let node: ReactNode

//   const nodeProps = { placeholder, style: { width }, ...res }

//   switch (type) {
//     case 'input':
//       node = (
//         <Input.Search
//           {...nodeProps}
//           onSearch={onSearch}
//           allowClear
//           enterButton={t('搜索')}
//           // className='select-table-search-button'
//         />
//       )
//       break
//     case 'select':
//       node = (
//         <Select
//           {...nodeProps}
//           options={options}
//           onSelect={onSearch}
//           allowClear
//         />
//       )
//       break
//     case 'cascader':
//       node = (
//         <Cascader
//           {...nodeProps}
//           options={options}
//           onChange={onSearch}
//           expandTrigger='hover'
//           showSearch
//         />
//       )
//       break
//     default:
//       node = <Input {...nodeProps} />
//   }

//   return node
// }

// const HocFormItem = (props: HocFormItemProps) => {
//   const {
//     ui: { name, label },
//   } = props
//   return (
//     <Form.Item key={name} name={name} label={label}>
//       {getElement({ ...props })}
//     </Form.Item>
//   )
// }

const Filter = forwardRef<FilterRef, FilterProps>((props, ref) => {
  const { filter, fetchList, extraRight, style, ...resProps } = props

  const [form] = Form.useForm()

  const onFinish = () => {
    const formValue = form.getFieldsValue()
    fetchList(formValue)
  }

  const onFieldsChange = (changedFields: FieldData[]) => {
    if (changedFields.length && changedFields[0]) {
      const { name } = changedFields[0]
      const itemIndex = _.findIndex(filter, (item) => {
        return isFieldName(name, item.name)
      })
      if (filter[itemIndex].type.includes('input')) {
        onFinish()
      }
    }
  }

  useImperativeHandle(ref, () => ({
    onFinish,
  }))

  return (
    <Row className='gm-table-filter-bar' align='middle'>
      <Col span={18}>
        <Form
          form={form}
          name='selece_table_filter'
          onFinish={onFinish}
          layout='inline'
          className='gm-fitler-bar-form'
          {...resProps}
          onFieldsChange={onFieldsChange}
        >
          <Space size={16}>
            {filter.map((item) => {
              if (item.select) {
                item.select.style = { minWidth: 167 }
              }
              return <FormItem noStyle key={item.id} {...item} />
            })}
          </Space>
        </Form>
      </Col>
      <Col span={4} offset={2}>
        <Row justify='end'>
          <Space size={16}>{extraRight}</Space>
        </Row>
      </Col>
    </Row>
  )
})

export default Filter
