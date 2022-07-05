/**
 * @description 新建商品 Form_Item
 */
import React, { FC } from 'react'
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Cascader,
  Checkbox,
  Radio,
  InputNumber,
  Space,
} from 'antd'

import UploadImage from '@/pages/merchandise/manage/components/upload_images'
import _ from 'lodash'
import { valueType } from 'antd/lib/statistic/utils'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import { pinyin } from '@gm-common/tool'

const { Option } = Select
const { TextArea, Search } = Input

const FormItem: FC<FormItemInterface<valueType>> = (props) => {
  const getSelect = (formItem: FormItemInterface<valueType>) => {
    if (formItem.select) {
      const { select, selectValueName, selectLabelName } = formItem
      const {
        style,
        options,
        showSearch,
        optionFilterProp,
        disabled,
        placeholder,
        allowClear,
      } = select
      return (
        <Select
          style={style}
          showSearch={showSearch}
          optionFilterProp={optionFilterProp}
          filterOption={(input: string, option: any) => {
            const text = input.toLocaleLowerCase()
            console.log('text', text)
            return (
              option!.children.indexOf(text) >= 0 ||
              pinyin(option!.children).indexOf(text) >= 0
            )
          }}
          disabled={disabled}
          placeholder={placeholder}
          allowClear={allowClear}
        >
          {_.map(options, (optionItem) => {
            const value = optionItem[selectValueName!]
            return (
              <Option key={value} value={value}>
                {optionItem[selectLabelName!]}
              </Option>
            )
          })}
        </Select>
      )
    }
    return ''
  }

  const getCheckboxGroup = (formItem: FormItemInterface<valueType>) => {
    if (formItem.checkboxGroup) {
      return <Checkbox.Group {...formItem.checkboxGroup} />
    }
    return ''
  }
  const getTexarea = (formItem: FormItemInterface<valueType>) => {
    if (formItem.inputTextarea) {
      return <TextArea {...formItem.inputTextarea} />
    }
    return ''
  }

  const getInput = (formItem: FormItemInterface<valueType>) => {
    if (formItem.input) {
      return <Input {...formItem.input} />
    }
    return ''
  }

  const getRadio = (formItem: FormItemInterface<valueType>) => {
    if (formItem.radioGroup) {
      return <Radio.Group {...formItem.radioGroup} />
    }
    return ''
  }

  const getNumber = (formItem: FormItemInterface<valueType>) => {
    if (formItem.inputNumber) {
      return <InputNumber {...formItem.inputNumber} />
    }
    return ''
  }

  const getUploadImage = (formItem: FormItemInterface<valueType>) => {
    if (formItem.uploadImage) {
      return (
        <>
          <UploadImage {...formItem.uploadImage} />
        </>
      )
    }
    return ''
  }

  const getSearch = (formItem: FormItemInterface<valueType>) => {
    if (formItem.inputSearch) {
      return <Search {...formItem.inputSearch} />
    }
    return ''
  }

  const getFormContent = (formItem: FormItemInterface<valueType>) => {
    switch (formItem.type) {
      case 'select':
        return getSelect(formItem)
      case 'checkboxGroup':
        return getCheckboxGroup(formItem)
      case 'inputTextarea':
        return getTexarea(formItem)
      case 'cascader':
        return (
          <Cascader
            displayRender={(label) => {
              if (label.join) {
                return label.join(' / ')
              } else {
                return ''
              }
            }}
            {...formItem.cascader}
          />
        )
      case 'input':
        return getInput(formItem)
      case 'inputGroup':
        if (formItem.inputGroup) {
          return (
            <Input.Group>
              <Space size={0} align='start'>
                {_.map(formItem.formItems, (formChild) => {
                  const { name, label } = formChild
                  return (
                    <Form.Item key='id' name={name} label={label}>
                      {getFormItem(formChild)}
                    </Form.Item>
                  )
                })}
              </Space>
            </Input.Group>
          )
        }
        return
      case 'radioGroup':
        return getRadio(formItem)
      case 'inputNumber':
        return getNumber(formItem)
      case 'uploadImage':
        return getUploadImage(formItem)
      case 'customer':
        return formItem.customer
      case 'inputSearch':
        return getSearch(formItem)
      default:
        return ''
    }
  }

  const getFormItem = (
    formItem: FormItemInterface<valueType>,
    hasLabel = true,
    itemStyle = false,
  ) => {
    const {
      name,
      label,
      tooltip,
      required,
      rules,
      wrapperCol,
      noStyle,
      style,
    } = formItem
    return (
      <Form.Item
        labelCol={{ span: 8 }}
        wrapperCol={wrapperCol || { span: 12 }}
        noStyle={itemStyle || noStyle}
        style={style}
        name={name}
        label={hasLabel ? label : ''}
        required={required || false}
        rules={rules || []}
        tooltip={tooltip}
      >
        {getFormContent(formItem)}
      </Form.Item>
    )
  }

  return (
    <>
      {props.toolTipDom ? (
        <Form.Item
          label={props.label}
          labelCol={{ span: 8 }}
          required={props.required}
        >
          <Row>
            <Col span={24 - props.toolTipDomSpan!}>
              {getFormItem(props, false, true)}
            </Col>
            <Col span={props.toolTipDomSpan}>{props.toolTipDom}</Col>
          </Row>
        </Form.Item>
      ) : (
        getFormItem(props)
      )}
    </>
  )
}

export default FormItem
