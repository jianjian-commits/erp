/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { FC, useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { deliveryType } from '@/pages/order/enum'
import Panel from '@/pages/order/order_manage/list/components/product_plan/components/panel'
import { Form, Input, Select, Button, DatePicker, Row, Col } from 'antd'
import moment from 'moment'

import _ from 'lodash'
import {
  SyncPurchaseTaskFromOrder,
  SyncPurchaseTaskFromOrderRequest,
} from 'gm_api/src/orderlogic'
import supplierStore from '@/pages/purchase/store'
import globalStore from '@/stores/global'
import store from '../../store'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import { NotProcessedData } from '../../../interface'
export const initNotProcessedData = {
  purchase_type: 1, // 计划交期设置
  purchase_batch: '', // 采购计划波次
  purchase_time: undefined, //  采购计划时间
  // isSetClassify: false, // 是否设置分类交期
  sortGroupList: [],
  supplier_id: '',
}
interface ProductPlanProps {
  onClose: () => void
  /** 区分按订单和按商品 */
  // isOrder?: boolean
}

interface Query {
  id: string
  type: string
}

const NotProcessedProductPlan: FC<ProductPlanProps> = (props) => {
  const { onClose } = props
  const { suppliers, fetchSuppliers } = supplierStore
  // 获取分类的type,非加工品为1
  // const settingType = 1

  useEffect(() => {
    fetchSuppliers()
  }, [])
  const { list, index, order, setPublishPurchase } = store
  const [form] = Form.useForm()
  const { id } = useGMLocation<Query>().query

  const [loading, setLoading] = useState(false)

  const [notProcessedData, setNotProcessedData] = useState<NotProcessedData>({
    ...initNotProcessedData,
  })

  /**
   * @description 表单提交方法
   */
  const handleSubmit = async (values: NotProcessedData) => {
    const batch = {
      name: values.purchase_batch || '',
      last_purchase_time: values.purchase_time
        ? moment(
            moment(values.purchase_time).format('YYYY-MM-DD HH:mm'),
          ).format('x')
        : undefined,
    }
    const sku_id = list[index].sku_id

    const detail_filter = {
      common_list_order: {
        order_ids: [order.order_id!],
      },
      sku_ids: [sku_id!],
      paging: { limit: 100 },
    }
    SyncPurchaseTaskFromOrder({
      batch,
      detail_filter,
      supplier_id: values.supplier_id,
    }).then((json) => {
      globalStore.showTaskPanel('1')
      setPublishPurchase(false)
    })
  }

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose()
  }

  return (
    <Form
      name='not_processed_form'
      layout='horizontal'
      form={form}
      initialValues={notProcessedData}
      onFinish={handleSubmit}
      onValuesChange={(changeValues, allValue) => {
        form.setFieldsValue({ ...changeValues })
      }}
    >
      <Panel title='采购计划' />
      <Row>
        <Col span={10}>
          <Form.Item name='purchase_type' label={t('计划交期设置')}>
            <Select
              placeholder={t('请选择')}
              style={{ width: '180px' }}
              options={deliveryType}
            />
          </Form.Item>
        </Col>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('purchase_type') === 2 ? (
              <Col span={7}>
                <Form.Item name='purchase_time' label=''>
                  <DatePicker
                    format='YYYY-MM-DD HH:mm'
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
                  />
                </Form.Item>
              </Col>
            ) : null
          }
        </Form.Item>

        <Col span={7}>
          <Form.Item name='purchase_batch' label={t('波次')}>
            <Input placeholder={t('请输入波次信息')} />
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item
            labelCol={{ offset: 1 }}
            name='supplier_id'
            label={t('设置供应商:')}
          >
            <Select
              style={{ width: '180px' }}
              placeholder={t('请输入供应商')}
              options={suppliers}
            />
          </Form.Item>
        </Col>
      </Row>

      <div className='gm-drawer-footer'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button htmlType='submit' type='primary' loading={loading}>
          {t('确定')}
        </Button>
      </div>
    </Form>
  )
}

export default observer(NotProcessedProductPlan)
