/**
 * @description 新建商品-基本信息-多单位管理
 */
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Row, Col, Modal, Form, Radio, Button, message } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { auxiliaryUnit } from '@/pages/merchandise/manage/merchandise_list/emnu'
import UnitConversion from '@/pages/merchandise/manage/merchandise_list/create/base_info/unit_conversion'
import { isNumberValid } from '@/pages/merchandise/manage/merchandise_list/create/util'
import { MulitUnitForm } from '@/pages/merchandise/manage/merchandise_list/create/type'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import globalStore, { UnitGlobal } from '@/stores/global'
import store from '../store'
import './style.less'

interface MerchandiseMultiUnitProps {
  /** 更新新建表单多单位数据 */
  setUnits: (values: MulitUnitForm) => void
}

const MerchandiseMultiUnit: FC<MerchandiseMultiUnitProps> = observer(
  (props) => {
    const [unitForm] = Form.useForm()
    /** 弹窗展示状态 */
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    /** 是否开启辅助单位 */
    const [hasAuxiliary, setHasAuxiliary] = useState<boolean>(false)

    const {
      multiUnitFormValue,
      unitList,
      basicUnitObj,
      auxiliaryUnitObj,
      auxiliaryUnitList,
      customBasicUnitList,
      setAuxiliaryUnitObj,
      setAuxiliaryUnitList,
      setMultiUnitFormValue,
      isAuxiliaryUnitDisabled,
      isCustomUnitDisabled,
      setIsCustomUnitDisabled,
      deleteCustomUnit,
    } = store

    useEffect(() => {
      if (modalVisible) {
        unitForm.setFieldsValue(multiUnitFormValue)
        setHasAuxiliary(!!Number(multiUnitFormValue.auxiliary))
      }
    }, [modalVisible])

    /** 打开弹窗，未选择基本单位不可打开弹窗 */
    const openMultiModal = (): any => {
      // 判断是否选择基本单位
      if (basicUnitObj.text) {
        setAuxiliaryUnitList()
        setModalVisible(true)
      } else {
        message.warning('请选择基本单位')
      }
    }

    const onValuesChange = (changedValues: any, allValues: any) => {
      if (changedValues.auxiliary) {
        const value = !!Number(changedValues.auxiliary)
        setHasAuxiliary(value)
        if (!value) {
          const newCustomUnits = _.filter(allValues.custom_units, (item) => {
            const { parent_id } = item
            const parentUnit = globalStore.getUnit(parent_id)
            return !parent_id || parentUnit.type !== auxiliaryUnitObj.type
          })

          const newFormValue = {
            ...allValues,
            second_base_unit_id: '',
            second_base_unit_ratio: 1,
            custom_units: newCustomUnits,
          }

          setAuxiliaryUnitObj()
          unitForm.setFieldsValue(newFormValue)
        }
        return
      }

      if (changedValues.second_base_unit_id) {
        const unit = _.filter(unitList, (unitItem) => {
          return unitItem.value === changedValues.second_base_unit_id
        })
        setAuxiliaryUnitObj(unit[0])
      }
    }

    /** 辅助单位校验 */
    const auxiliaryUnitValidator = (event: any, value: string) => {
      // 没有辅助单位
      if (!hasAuxiliary) {
        return Promise.resolve(new Error())
      }

      const second_base_unit_id = unitForm.getFieldValue('second_base_unit_id')
      const second_base_unit_ratio = unitForm.getFieldValue(
        'second_base_unit_ratio',
      )

      // 未填写完整
      if (
        !second_base_unit_id ||
        (!second_base_unit_ratio && second_base_unit_ratio !== 0)
      ) {
        return Promise.reject(new Error(t('请将辅助单位填写完整')))
      }

      // 换算值验证
      if (second_base_unit_ratio || second_base_unit_ratio === 0) {
        return isNumberValid(second_base_unit_ratio + '')
      }

      return Promise.resolve(new Error())
    }

    /** 自定义单位验证 */
    const customUnitValidator = (event: any, value: string) => {
      const nameList = event.field.split('.')
      // 当前修改自定义单位index
      const customIndex = nameList[1]
      // 当前修改项的值
      const customValue: { [key: string]: string } = { [nameList[2]]: value }
      // 所有自定义单位
      const customUnits = unitForm.getFieldValue('custom_units')
      // 当前修改的自定义单位
      const changedUnit = { ...customUnits[customIndex], ...customValue }

      const { custom_unit, rate, parent_id } = changedUnit

      // 未填写完整
      if (!custom_unit || (!rate && rate !== 0) || !parent_id) {
        return Promise.reject(new Error(t('请将自定义单位填写完整')))
      }

      // 自定义单位不能位空格
      if (custom_unit) {
        if (custom_unit.trim() === '') {
          return Promise.reject(new Error(t('自定义单位不能为空格符')))
        } else if (custom_unit.length > 5) {
          return Promise.reject(new Error(t('自定义单位长度不能超过5个字符')))
        }
      }

      // 判断自定义单位是否与辅助到位或基本单位同类型
      const index = _.findIndex(
        [...customBasicUnitList, auxiliaryUnitObj],
        (unitItem: UnitGlobal) => {
          return (
            unitItem.text === custom_unit.trim() ||
            unitItem.text.toLocaleLowerCase() ===
              custom_unit?.toLocaleLowerCase()
          )
        },
      )
      if (index > -1) {
        return Promise.reject(
          new Error(t('自定义单位不能与基本单位或辅助单位为同类型单位')),
        )
      }

      // 不能存在完全相同的两个自定义单位
      for (let i = 0; i < customUnits.length; i++) {
        if (i !== Number(customIndex)) {
          const unitItem = customUnits[i]
          if (unitItem) {
            if (unitItem.custom_unit && unitItem.custom_unit === custom_unit) {
              return Promise.reject(
                new Error(t('不能存在相同的两个自定义单位')),
              )
            }
          }
        }
      }

      // 换算值验证
      if (rate || rate === 0) {
        return isNumberValid(rate + '')
      }

      return Promise.resolve(new Error())
    }

    const handleOk = () => {
      unitForm.validateFields().then((values) => {
        props.setUnits(values)
        setMultiUnitFormValue(values)
        setModalVisible(false)
      })
    }

    const handleCancel = () => {
      if (multiUnitFormValue.auxiliary === '0') {
        setAuxiliaryUnitObj()
      }
      setModalVisible(false)
    }

    return (
      <>
        <Button type='link' onClick={openMultiModal}>
          {t('多单位管理')}
        </Button>
        <Modal
          width={600}
          title={t('多单位管理')}
          visible={modalVisible}
          onCancel={handleCancel}
          onOk={handleOk}
        >
          <Form
            className='merchandise-multi-unit'
            name='merchandise_multi_unit'
            layout='horizontal'
            labelAlign='right'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            form={unitForm}
            onValuesChange={onValuesChange}
            validateTrigger={['onFinish']}
          >
            <Form.Item label={t('辅助单位')} name='auxiliary'>
              <Radio.Group disabled={isAuxiliaryUnitDisabled}>
                {_.map(auxiliaryUnit, (item, index) => {
                  return (
                    <Radio key={index} value={item.value}>
                      {t(item.label)}
                    </Radio>
                  )
                })}
              </Radio.Group>
            </Form.Item>
            {hasAuxiliary && (
              <Form.Item
                name='auxiliary_unit_line'
                wrapperCol={{ span: 14, offset: 4 }}
                preserve
                dependencies={['second_base_unit_id', 'second_base_unit_ratio']}
                rules={[{ validator: auxiliaryUnitValidator }]}
              >
                <UnitConversion
                  front={{
                    inputName: 'second_base_num',
                    afterName: 'second_base_unit_id',
                    afterType: 'select',
                    selectList: auxiliaryUnitList,
                    disabled: true,
                    afterDisabled: isAuxiliaryUnitDisabled,
                  }}
                  end={{
                    inputName: 'second_base_unit_ratio',
                    afterName: 'second_base_parent',
                    afterType: 'input',
                    disabled: isAuxiliaryUnitDisabled,
                    afterDisabled: true,
                    min: 0,
                  }}
                />
              </Form.Item>
            )}
            <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
              <span className='merchandise-form-unit-tip'>
                {t(
                  '辅助单位主要用于海鲜等非标准化产品，如鱼既可以用斤展示，也可以用条展示。',
                )}
              </span>
            </Form.Item>
            <Form.List name='custom_units'>
              {(fields, { add, remove }) => {
                return (
                  <>
                    <Form.Item label={t('自定义单位')}>
                      {fields.length === 0 && (
                        <Button
                          type='link'
                          icon={<PlusCircleOutlined />}
                          onClick={() => add()}
                        >
                          {t('新增一行')}
                        </Button>
                      )}
                    </Form.Item>
                    {_.map(fields, (fieldItem, index) => {
                      return (
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          label={t(`单位${index + 1}`)}
                          name={[fieldItem.name, 'unit_num']}
                          key={index}
                          dependencies={[['parent_id']]}
                          rules={[{ validator: customUnitValidator }]}
                        >
                          <Row align='middle'>
                            <Col span={18}>
                              <UnitConversion
                                front={{
                                  afterName: [fieldItem.name, 'custom_unit'],
                                  defaultValue: 1,
                                  disabled: true,
                                  afterType: 'input',
                                  afterDisabled: isCustomUnitDisabled[index],
                                }}
                                end={{
                                  inputName: [fieldItem.name, 'rate'],
                                  afterName: [fieldItem.name, 'parent_id'],
                                  afterType: 'select',
                                  disabled: isCustomUnitDisabled[index],
                                  afterDisabled: isCustomUnitDisabled[index],
                                  selectList: customBasicUnitList,
                                  min: 0,
                                }}
                              />
                            </Col>
                            <Col span={4} offset={2}>
                              {fields.length && (
                                <a
                                  onClick={() => {
                                    if (isCustomUnitDisabled[index]) {
                                      setIsCustomUnitDisabled()
                                      deleteCustomUnit(index)
                                    }

                                    remove(fieldItem.name)
                                  }}
                                >
                                  <DeleteOutlined className='delete_out_lined' />
                                </a>
                              )}
                            </Col>
                          </Row>
                        </Form.Item>
                      )
                    })}
                    {fields.length > 0 && fields.length < 3 && (
                      <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                        <Button
                          type='link'
                          icon={<PlusCircleOutlined />}
                          onClick={() => add()}
                        >
                          {t('新增一行')}
                        </Button>
                      </Form.Item>
                    )}
                    <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                      <span className='merchandise-form-unit-tip'>
                        {t(
                          '自定义单位主要用于标准品的包装规格，如酱油、陈醋等。',
                        )}
                      </span>
                    </Form.Item>
                  </>
                )
              }}
            </Form.List>
          </Form>
        </Modal>
      </>
    )
  },
)

export default MerchandiseMultiUnit
