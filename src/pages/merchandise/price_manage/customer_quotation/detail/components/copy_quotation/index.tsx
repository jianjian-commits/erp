import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { t } from 'gm-i18n'
import { Input, Modal, Form, Radio, message, Select, DatePicker } from 'antd'
import {
  IS_DEFAULT_ENUM,
  QUOTATION_TYPE,
  STATUS_RADIO_ENUM,
} from '../../../constants'
import { CopyQuotationV2, Quotation_Type } from 'gm_api/src/merchandise'
import usePeriodicQuotationsOptions from './use_periodic_quotations_options'
import { FormModel } from './model'
import { devWarn } from '@gm-common/tool'
import _ from 'lodash'

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

export interface CopyQuotationRef {
  handleOpen: () => void
  handleClose: () => void
}

interface CopyQuotationProps {
  /**
   * 需要被复制的报价单 id
   */
  quotationId: string
  /**
   * 刷新报价单列表
   */
  refresh: () => void
}

/** 复制报价单 */
const CopyQuotation = forwardRef<CopyQuotationRef, CopyQuotationProps>(
  (props, ref) => {
    const { quotationId, refresh } = props
    const [form] = Form.useForm()
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [quotationType, setQuotationType] = useState<Quotation_Type>(
      Quotation_Type.WITHOUT_TIME,
    )
    // 当前选择的报价单类型为周期报价单
    const isPeriodic = quotationType === Quotation_Type.PERIODIC
    // 当前选择的报价单类型为普通报价单
    const isNormal = quotationType === Quotation_Type.WITHOUT_TIME

    const parentQuotations = usePeriodicQuotationsOptions({
      ready: visible && isPeriodic,
      once: true,
    })

    const showModal = () => {
      setVisible(true)
    }

    const handleCancel = () => {
      setVisible(false)
      setLoading(false)
      form.resetFields()
    }

    useImperativeHandle(ref, () => ({
      handleOpen: showModal,
      handleClose: handleCancel,
    }))

    const handleValuesChange = (_changed: any, allValues: any) => {
      setQuotationType(allValues.quotation_type)
    }

    const handleSubmit = (model: FormModel) => {
      if (_.trim(quotationId).length === 0) {
        devWarn(() => {
          console.error('[复制报价单]: 缺少被复制报价单的 id')
        })
        return
      }

      setLoading(true)

      let start_time: string | undefined
      let end_time: string | undefined
      let parent_id: string | undefined
      if (model.quotation_type === Quotation_Type.PERIODIC) {
        const [start, end] = model.effect_period
        start_time = `${start.startOf('day').valueOf()}`
        end_time = `${end.endOf('day').valueOf()}`
        parent_id = model.parent_quotation
      }

      CopyQuotationV2({
        source_quotation_id: quotationId,
        quotation: {
          // @ts-ignore 不需要传递此参数
          quotation_id: undefined,
          start_time,
          end_time,
          parent_id,
          status: model.status,
          inner_name: model.inner_name,
          outer_name: model.outer_name,
          description: model.description,
          type: model.quotation_type,
          is_default: model.is_default || false,
        },
      })
        .then(() => {
          message.success(t('操作成功'))
          handleCancel()
          refresh()
        })
        .finally(() => setLoading(false))
    }

    return (
      <Modal
        title={t('复制报价单')}
        destroyOnClose
        onOk={form.submit}
        confirmLoading={loading}
        onCancel={handleCancel}
        visible={visible}
        afterClose={() => {
          setQuotationType(Quotation_Type.WITHOUT_TIME)
        }}
      >
        <Form
          form={form}
          {...formItemLayout}
          layout='horizontal'
          onValuesChange={handleValuesChange}
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name='quotation_type'
            initialValue={quotationType}
            label={t('报价单类型')}
            rules={[{ required: true, message: '请选择报价单类型' }]}
          >
            <Select options={QUOTATION_TYPE} />
          </Form.Item>
          {isPeriodic && (
            <Form.Item
              name='parent_quotation'
              label={t('父报价单')}
              rules={[
                { required: true, whitespace: true, message: '请选择父报价单' },
              ]}
            >
              <Select
                options={parentQuotations}
                placeholder={t('请选择父报价单')}
                showSearch
                filterOption={(input, option) =>
                  new RegExp(`${input}`).test(option?.label as string)
                }
              />
            </Form.Item>
          )}
          <Form.Item
            label={t('报价单名称')}
            name='inner_name'
            rules={[{ required: true, whitespace: true }, { max: 30 }]}
          >
            <Input placeholder={t('输入报价单名称')} />
          </Form.Item>
          {isNormal && (
            <Form.Item
              name='outer_name'
              label={t('对外名称')}
              rules={[{ required: true, whitespace: true }, { max: 6 }]}
            >
              <Input placeholder={t('用于下单商城的展现，不超过6个字符')} />
            </Form.Item>
          )}
          {quotationType === Quotation_Type.PERIODIC && (
            <Form.Item
              name='effect_period'
              label={t('生效周期')}
              rules={[{ required: true, message: '必填' }]}
            >
              <DatePicker.RangePicker />
            </Form.Item>
          )}
          {quotationType !== Quotation_Type.PERIODIC && (
            <Form.Item
              label={t('设置默认')}
              name='is_default'
              help={t('报价单列表中仅能存在一个默认报价单')}
              initialValue={false}
            >
              <Radio.Group options={IS_DEFAULT_ENUM} />
            </Form.Item>
          )}
          <Form.Item
            label={t('状态')}
            name='status'
            initialValue={STATUS_RADIO_ENUM[0].value}
          >
            <Radio.Group options={STATUS_RADIO_ENUM} />
          </Form.Item>
          {isNormal && (
            <Form.Item
              label={t('描述')}
              rules={[{ max: 100 }]}
              name='description'
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    )
  },
)

CopyQuotation.displayName = 'CopyQuotation'

export default CopyQuotation
