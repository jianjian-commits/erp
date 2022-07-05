import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { Button, Form, FormInstance, Row, Col } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import SvgDelete from '@/svg/delete.svg'
import RangePriceFormItem from './range_price_form_item'
import _ from 'lodash'

import { isRequired, isInterval, isRepeat, isValid } from './validator'
import { devWarnForHook } from '@gm-common/tool'
import './style.less'

interface RangePriceProps {
  /**
   * 表单实例
   */
  form: FormInstance
  /**
   * 字段名称
   *
   * @default "rangePriceList"
   */
  fieldName?: string
  /**
   * 最大可新增区间个数
   *
   * @default 10
   */
  limit?: number
}

// 校验函数h
const validator = [isRequired, isInterval, isRepeat, isValid]

const RangePrice: React.VFC<RangePriceProps> = (props) => {
  const { form, limit = 10, fieldName = 'rangePriceList' } = props

  devWarnForHook(() => {
    if (_.isNil(form)) {
      console.error(
        `<RangePrice /> 组件缺少 form 实例。\n组件将无法正常运行，请使用 antd Form.useForm 创建实例并传入。`,
      )
    }
  })

  const verify = useCallback(() => {
    // 表单项 remove 时无法直接校验，使用异步推迟校验时机才能触发下一次渲染的校验
    Promise.resolve().then(() => {
      const model = form.getFieldValue(fieldName) || []
      const path = _.map(model, (_item, itemIndex) => [fieldName, itemIndex])
      form.validateFields(path)
    })
  }, [fieldName, form])

  const fieldKey = useRef(fieldName)
  fieldKey.current = fieldName

  const [type, setType] = useState<string>()
  useEffect(() => {
    if (_.isNil(type)) {
      return
    }
    form.setFields([
      {
        name: fieldKey.current,
        value: _.map(form.getFieldValue(fieldKey.current), (item) => ({
          ...item,
          type,
        })),
      },
    ])
  }, [form, type])

  return (
    <div className='range-price-root'>
      <Form.List name={fieldName} initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }, index) => {
              return (
                <Row key={key} align='middle' style={{ marginBottom: 16 }}>
                  <Col span={22}>
                    <Form.Item
                      className='gm-margin-bottom-0'
                      colon={false}
                      label={index + 1}
                      labelCol={{ span: 1 }}
                      name={name}
                      normalize={(value) => {
                        setType(value.type)
                        return value
                      }}
                      preserve
                      rules={[
                        ({ getFieldsValue }) => {
                          return {
                            validator: (_rule, val = {}) => {
                              const _model = getFieldsValue(true)
                              const errorList: string[] = []
                              validator.every((valid) => {
                                const { isValid, message } = valid({
                                  value: val,
                                  list: _.get(_model, fieldName, []),
                                  index,
                                })
                                if (!isValid) {
                                  errorList.push(message)
                                }
                                return isValid
                              })
                              if (!_.isEmpty(errorList)) {
                                return Promise.reject(
                                  Error(errorList.join(', ')),
                                )
                              }
                              return Promise.resolve()
                            },
                          }
                        },
                      ]}
                    >
                      <RangePriceFormItem />
                    </Form.Item>
                  </Col>
                  <Col span={2} className='tw-text-right'>
                    <Button
                      className='delete-btn'
                      shape='circle'
                      onClick={() => {
                        remove(name)
                        // verify()
                      }}
                      disabled={fields.length === 1}
                      icon={<SvgDelete />}
                    />
                  </Col>
                </Row>
              )
            })}
            {fields.length < limit && (
              <Button
                className='tw-block'
                type='link'
                onClick={() => {
                  // 新增一行时，默认使用上一次的 type 初始化
                  add({ type })
                }}
                icon={<PlusCircleOutlined />}
              >
                {t('增加一行')}
              </Button>
            )}
          </>
        )}
      </Form.List>
    </div>
  )
}

export default RangePrice
