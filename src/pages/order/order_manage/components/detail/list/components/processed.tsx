/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { FC, useState, useEffect } from 'react'
import { deliveryType } from '@/pages/order/enum'
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
} from 'antd'
import { t } from 'gm-i18n'

import _ from 'lodash'
import moment from 'moment'

import Panel from '@/pages/order/order_manage/list/components/product_plan/components/panel'
import { TaskMergeMode } from 'gm_api/src/production'

import supplierStore from '@/pages/purchase/store'
import globalStore from '@/stores/global'
import store from '../../store'
import tableStore from '@/common/components/async_task/store'
import { observer } from 'mobx-react'
import { ProcessedData } from '../../../interface'
import {
  DispatchProductionTaskFromOrderRequest,
  DispatchProductionTaskFromOrder,
} from 'gm_api/src/orderlogic'

const initProcessedData: ProcessedData = {
  // isSetClassify: false, // 是否设置分类交期
  production_merge_mode: 0, // 生产计划模式设置
  pack_merge_mode: 0, // 包装计划模式设置

  purchase_type: 1, // 采购计划交期设置
  production_cleanfood_type: 1, // 生产单品BOM计划交期设置
  production_type: 1, // 生产组合BOM计划交期设置
  pack_type: 1, // 包装计划交期设置

  pack_time: undefined, // 包装计划时间
  purchase_time: undefined, // 采购计划时间
  production_time: undefined, // 生产单品BOM交期时间
  production_cleanfood_time: undefined, // 生产组合BOM交期时间

  purchase_batch: '', // 采购计划波次
  production_cleanfood_batch: '', // 生产计划单品BOM波次
  production_batch: '', // 生产计划组合BOM波次
  pack_batch: '', // 包装计划波次
}

const TaskRadioType = [
  {
    value: TaskMergeMode.MERGE_MODE_UNSPECIFIED,
    label: t('默认'),
  },
  {
    value: TaskMergeMode.MERGE_MODE_CUSTOMER,
    label: t('按客户生产'),
  },
  {
    value: TaskMergeMode.MERGE_MODE_ROUTE,
    label: t('按线路生产'),
  },
]

interface ProductPlanProps {
  onClose: () => void
}

const ProcessedProductPlan: FC<ProductPlanProps> = (props) => {
  const { onClose } = props
  // const { suppliers, fetchSuppliers } = supplierStore
  const { list, index, order, setPublishPurchase, publishPurchase } = store
  const [form] = Form.useForm()

  // 获取分类的type,加工品为2
  // const settingType = 2

  const [loading, setLoading] = useState(false)
  const [processedData, setProcessedData] =
    useState<ProcessedData>(initProcessedData)

  // 已选择的所有Id集合，用于计算树的互斥逻辑

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose()
  }
  /**
   * @description 表单提交方法
   */
  const handleSubmit = async (fieldsValue: ProcessedData) => {
    setLoading(true)
    const {
      purchase_time,
      purchase_batch,
      pack_time,
      pack_batch,
      pack_merge_mode,
      production_merge_mode,
      production_time,
      production_batch,
      production_cleanfood_time,
      production_cleanfood_batch,
      // isSetClassify,
    } = fieldsValue
    const purchase_pairs = {
      type: 2,
      rsp_time:
        purchase_time &&
        moment(moment(purchase_time).format('YYYY-MM-DD HH:mm')).format('x'),
      categories: { category_ids: [] },
      batch: purchase_batch,
    }

    const pack_pairs = {
      type: 4,
      rsp_time:
        pack_time &&
        moment(moment(pack_time).format('YYYY-MM-DD HH:mm')).format('x'),
      categories: { category_ids: [] },
      batch: pack_batch,
    }
    const production_pairs = {
      type: 3,
      rsp_time:
        production_time &&
        moment(moment(production_time).format('YYYY-MM-DD HH:mm')).format('x'),
      categories: { category_ids: [] },
      batch: production_batch,
    }

    const production_cleanfood_pairs = {
      type: 7,
      rsp_time:
        production_cleanfood_time &&
        moment(
          moment(production_cleanfood_time).format('YYYY-MM-DD HH:mm'),
        ).format('x'),
      categories: { category_ids: [] },
      batch: production_cleanfood_batch,
    }
    // 获取sku
    const sku_id = list[index].sku_id

    const params: DispatchProductionTaskFromOrderRequest = {
      detail_filter: {
        common_list_order: {
          order_ids: [order.order_id!],
        },
        sku_ids: [sku_id!],
        paging: { limit: 100 },
      },
      all_order: false,
      // all_order: !!isSelectAll,
      pack_merge_mode,
      production_merge_mode,
      appoint_time_pairs: [
        purchase_pairs,
        pack_pairs,
        production_pairs,
        production_cleanfood_pairs,
      ],
    }
    DispatchProductionTaskFromOrder({ ...params }).then((json) => {
      globalStore.showTaskPanel('1')
      setPublishPurchase(false)
    })
  }

  return (
    <Form
      name='processed_form'
      layout='horizontal'
      form={form}
      initialValues={processedData}
      onFinish={handleSubmit}
      onValuesChange={(changeValues, allValue) => {
        form.setFieldsValue({ ...changeValues })
      }}
    >
      <Panel title={t('采购计划')} />
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

        {/* <Col span={10}>
          <Form.Item
            labelCol={{ offset: 1 }}
            name='purchase_supplier'
            label={t('设置供应商:')}
          >
            <Select
              style={{ width: '180px' }}
              placeholder={t('请输入供应商')}
              options={suppliers}
            />
          </Form.Item>
        </Col> */}
      </Row>
      <Panel title={t('生产计划')} />
      <Form.Item name='production_merge_mode' label={t('生产模式设置')}>
        <Radio.Group name='production_merge_mode' options={TaskRadioType} />
      </Form.Item>
      <Divider orientation='left'>{t('单品')}</Divider>
      <Row gutter={6}>
        <Col span={9}>
          <Form.Item name='production_cleanfood_type' label={t('计划交期设置')}>
            <Select placeholder={t('请选择')} options={deliveryType} />
          </Form.Item>
        </Col>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('production_cleanfood_type') === 2 ? (
              <Col span={7}>
                <Form.Item name='production_cleanfood_time' label=''>
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
          <Form.Item name='production_cleanfood_batch' label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
          </Form.Item>
        </Col>
      </Row>
      <Divider orientation='left'>{t('组合')}</Divider>
      <Row gutter={6}>
        <Col span={9}>
          <Form.Item name='production_type' label={t('计划交期设置')}>
            <Select placeholder={t('请选择')} options={deliveryType} />
          </Form.Item>
        </Col>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('production_type') === 2 ? (
              <Col span={7}>
                <Form.Item name='production_time' label=''>
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
          <Form.Item name='production_batch' label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
          </Form.Item>
        </Col>
      </Row>
      <Panel title={t('包装计划')} />
      <Form.Item name='pack_merge_mode' label={t('生产模式设置')}>
        <Radio.Group name='pack_merge_mode' options={TaskRadioType} />
      </Form.Item>
      <Row gutter={6}>
        <Col span={9}>
          <Form.Item name='pack_type' label={t('计划交期设置')}>
            <Select placeholder={t('请选择')} options={deliveryType} />
          </Form.Item>
        </Col>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('pack_type') === 2 ? (
              <Col span={7}>
                <Form.Item name='pack_time' label=''>
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
          <Form.Item name='pack_batch' label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
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

export default observer(ProcessedProductPlan)
