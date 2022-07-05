/**
 * @description 新建/编辑周期报价单子报价单
 */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { Modal, Form, Input, DatePicker, message } from 'antd'
import {
  CreateQuotationV2,
  Quotation,
  Quotation_Status,
  Quotation_Type,
  UpdateQuotationV2,
} from 'gm_api/src/merchandise'
import baseStore from '../../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import store from '../store'

export interface CreateModalRef {
  setIsVisible: (visible: boolean) => void
}

interface CreateModalProps {
  quotation?: Quotation
  isCreate: boolean
}

const { RangePicker } = DatePicker

const CreateChildQuotation = forwardRef<CreateModalRef, CreateModalProps>(
  (props, ref) => {
    const { isCreate, quotation } = props
    const { setPagingOffset, setChildQuotationList } = store

    const [isVisible, setIsVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [childQuotationForm] = Form.useForm()

    useImperativeHandle(ref, () => ({
      setIsVisible,
    }))

    useEffect(() => {
      if (!isCreate && quotation) {
        const { inner_name, start_time, end_time } = quotation
        childQuotationForm.setFieldsValue({
          name: inner_name || '',
          time: [moment(Number(start_time)), moment(Number(end_time))],
        })
      }
    }, [quotation])

    const handleOk = () => {
      childQuotationForm.validateFields().then(() => {
        setIsLoading(true)
        const { name, time } = childQuotationForm.getFieldsValue()
        const startTime = moment(time[0]).startOf('day').valueOf().toString()
        const endTime = moment(time[1]).endOf('day').valueOf().toString()
        const quotationName =
          name || moment(time[0]).format('yyyy-MM-DD') + '报价'
        childQuotationForm.setFieldsValue({ name: quotationName, time })

        const { inner_name, outer_name, serial_no, status } =
          baseStore.parentQuotation
        const data = {
          start_time: startTime,
          end_time: endTime,
          inner_name: quotationName,
          outer_name: outer_name,
          parent_child_inner_name: `${inner_name}_${quotationName}`,
          parent_serial_no: serial_no,
        }
        if (isCreate) {
          const newQuotation = {
            ...data,
            type: Quotation_Type.PERIODIC,
            parent_id: baseStore.parentQuotationId,
            status: Quotation_Status.STATUS_UNSPECIFIED,
          }
          creatChild(newQuotation)
        } else {
          const newQuotation = {
            ...quotation!,
            ...data,
          }
          editChild(newQuotation)
        }
      })
    }

    /** 新建子报价单 */
    const creatChild = (newQuotation: Quotation) => {
      CreateQuotationV2({ quotation: newQuotation })
        .then((json) => {
          baseStore.getQuotationRequest(baseStore.parentQuotationId)
          message.success(t('新建成功'))
          setPagingOffset(false)
          handleCancel()
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    /** 编辑子报价单 */
    const editChild = (newQuotation: Quotation) => {
      UpdateQuotationV2({ quotation: newQuotation })
        .then((json) => {
          message.success(t('编辑成功'))
          const { start_time = '', end_time = '' } =
            json.response.quotation || {}
          baseStore.getQuotationRequest(baseStore.parentQuotationId)
          if (
            start_time === quotation?.start_time &&
            end_time === quotation.end_time
          ) {
            setChildQuotationList(
              quotation?.quotation_id!,
              json.response.quotation,
            )
          } else {
            setPagingOffset(false)
          }

          handleCancel()
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    const handleCancel = () => {
      setIsVisible(false)
      childQuotationForm.resetFields()
    }

    const title = <> {t(`${isCreate ? '新建' : '编辑'}子报价单`)}</>

    return (
      <Modal
        title={title}
        destroyOnClose
        visible={isVisible}
        onOk={handleOk}
        confirmLoading={isLoading}
        onCancel={handleCancel}
      >
        <Form
          layout='horizontal'
          labelAlign='right'
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 13 }}
          form={childQuotationForm}
        >
          <Form.Item
            name='name'
            rules={[{ max: 30 }]}
            label={t('子报价单名称')}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item
            name='time'
            label={t('生效周期')}
            required
            rules={[
              {
                required: true,
                message: t('请选择生效周期'),
              },
            ]}
          >
            <RangePicker
              disabled={quotation?.status === Quotation_Status.STATUS_EXPIRED}
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  },
)

export default observer(CreateChildQuotation)
