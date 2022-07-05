/**
 * @description 同一报价同一商品不同单位价格目同步
 */
import React, { FC, RefObject, useImperativeHandle, useState } from 'react'
import { Modal, Form, Checkbox, message, Row, Col } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  ChildrenType,
  UnitOptions,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import { Sku } from 'gm_api/src/merchandise'
import './style.less'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

export interface SyncPriceItemlRef {
  /** 打开同步弹窗 */
  handleOpenSync: (record: ChildrenType) => void
}

interface SyncPriceItemlProps {
  modalRef: RefObject<SyncPriceItemlRef>
  /** 价格条目列表 */
  priceList: ChildrenType[]
  /** 同步价格 */
  syncPrice: (
    newPriceList: ChildrenType[],
    newFieldsValue: { [key: string]: any },
  ) => void
  /** 当前绑定的商品 */
  sku: Sku
}

const SyncPriceItem: FC<SyncPriceItemlProps> = (props) => {
  const { modalRef, syncPrice, priceList, sku } = props

  const [isVisible, setIsVisible] = useState(false)
  /** 作为基础单位的下单单位 */
  const [baseUnit, setBaseUnit] = useState<UnitOptions>({
    label: '',
    value: '',
    unit: 0,
  })
  /** 可同步的单位列表 */
  const [unitList, setUnitList] = useState<UnitOptions[]>([])
  /** checkbox勾选数量 */
  const [checkCount, setCheckCount] = useState(0)
  const [syncPriceForm] = Form.useForm()

  useImperativeHandle(modalRef, () => ({
    handleOpenSync,
  }))

  /** 打开同步弹窗 */
  const handleOpenSync = (record: ChildrenType) => {
    const {
      order_unit_id: orderUnitId,
      fee_unit_price: { val, unit_id },
    } = record
    const formFieldsValue: { [key: string]: boolean } = {}
    if (!orderUnitId) {
      /** 当前条目没有选择下单单位 */
      return message.error(t('请为当前条目选择下单单位'))
    }

    /** 当前条目商品价格信息填写不完整 */
    if (!val || !unit_id) {
      return message.error(t('请将当前条目商品单价填写完整'))
    }

    if (priceList.length === 1) {
      /** 只有一条价格条目 */
      return message.error(t('请添加条目后进行同步'))
    }

    /** 获取可同步条目单位列表 */
    const list: UnitOptions[] = []
    _.forEach(priceList, (priceItem) => {
      const { order_unit_id, units } = priceItem
      if (order_unit_id && order_unit_id !== orderUnitId) {
        const unitObj = _.find(
          units,
          (unitItem) => unitItem.value === order_unit_id,
        )
        if (unitObj) {
          list.push(unitObj)
          formFieldsValue[unitObj.value] = true
        }
      }
    })

    if (!list.length) {
      /** 多个价格条目，但没有一条同时拥有过下单单位和商品单价单位 */
      return message.error(t('至少需要一个条目选择下单单位'))
    }

    setCheckCount(list.length)

    const baseUnitObj = _.find(
      priceList[0].units,
      (unitItem) => unitItem.value === orderUnitId,
    )

    if (baseUnitObj) {
      setBaseUnit(baseUnitObj)
    }

    setUnitList(list)
    syncPriceForm.setFieldsValue(formFieldsValue)
    setIsVisible(true)
  }

  const onCheckChange = (e: CheckboxChangeEvent) => {
    if (e.target?.checked) {
      setCheckCount(checkCount + 1)
    } else {
      setCheckCount(checkCount - 1)
    }
  }

  /** 确定 */
  const handleOk = () => {
    /** 更新后列表数据 */
    const newPriceList: ChildrenType[] = []
    /** 更新后表单数据 */
    const newFieldsValue: { [key: string]: any } = {}
    const formValue = syncPriceForm.getFieldsValue()

    /** 基础价格条目 */
    const basePriceItem = _.find(
      priceList,
      (priceItem) => priceItem.order_unit_id === baseUnit.value,
    )

    const { fee_unit_price, formula_text, pricing_formula, pricing_type } =
      basePriceItem!

    _.forEach(priceList, (priceItem) => {
      const { id, order_unit_id } = priceItem
      if (order_unit_id && formValue[order_unit_id]) {
        /** 被选中进行数据替换 */
        /** TODO：同步后定价公式 */
        newPriceList.push({
          ..._.cloneDeep(priceItem),
          fee_unit_price: _.cloneDeep(fee_unit_price),
          formula_text,
          pricing_formula,
          pricing_type,
        })

        newFieldsValue[`unit_id_val${id}`] = fee_unit_price.val
        newFieldsValue[`unit_id${id}`] = fee_unit_price.unit_id
      } else {
        /** 未被选中，不进行替换 */
        newPriceList.push(_.cloneDeep(priceItem))
      }
    })

    syncPrice(newPriceList, newFieldsValue)
    handleCancel()
  }

  const handleCancel = () => {
    setIsVisible(false)
    syncPriceForm.resetFields()
  }

  return (
    <Modal
      title={t('同步价格')}
      destroyOnClose
      visible={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ disabled: !checkCount }}
    >
      <p>{t(`将【${baseUnit!.label}】的商品单价和定价公式同步至：`)}</p>
      <Form form={syncPriceForm}>
        <Row gutter={24}>
          {_.map(unitList, (item) => (
            <Col className='sync_prie_unit_item' span={8} key={item.value}>
              <Form.Item name={item.value} valuePropName='checked'>
                <Checkbox onChange={onCheckChange}>
                  {t(item.label as string)}
                </Checkbox>
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  )
}

export default SyncPriceItem
