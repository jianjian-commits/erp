/**
 * @description 编辑组合商品-绑定报价单弹窗
 */
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'
import { observer } from 'mobx-react'
import {
  Modal,
  Table,
  Form,
  Button,
  InputNumber,
  Select,
  message,
  Space,
} from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import globalStore from '@/stores/global'
import store from '../store'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { gmHistory as history } from '@gm-common/router'
import { priceValidator } from '@/pages/merchandise/util'

export interface QuotationTableRef {
  setIsShow: (params: boolean) => void
}

const { Option } = Select

const QuotationTable = observer(
  forwardRef<QuotationTableRef, any>((props, modalRef) => {
    const {
      boundTableList,
      setBoundListTotalPrice,
      boundFormFields,
      submitUpdate,
      clearQuotationTable,
    } = store
    const [isShow, setIsShow] = useState<boolean>(false)
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)
    const [boundCombineForm] = Form.useForm()

    useEffect(() => {
      return () => clearQuotationTable()
    }, [])

    useEffect(() => {
      boundCombineForm.setFieldsValue(boundFormFields)
    }, [boundFormFields])

    useImperativeHandle(modalRef, () => ({
      setIsShow,
    }))

    const onValueChange = (values: any, allValues: any) => {
      const keys = _.keys(values)
      const lineValue = allValues[keys[0]]
      if (lineValue.price && lineValue.fee_unit_price.unit_id) {
        setBoundListTotalPrice({ [keys[0]]: allValues[keys[0]] })
      }
    }

    /** 取消 */
    const handleCancel = () => {
      setIsShow(false)
    }

    /** 提交编辑请求 */
    const update = () => {
      setSubmitLoading(true)
      submitUpdate()
        .then(() => {
          history.go(-1)
        })
        .catch((err) => {
          console.log('bound err', err)
        })
        .finally(() => {
          setSubmitLoading(false)
        })
    }

    /** 确定 */
    const handleOk = async () => {
      boundCombineForm.submit()
      boundCombineForm
        .validateFields()
        .then(() => {
          update()
        })
        .catch((err) => {
          message.error(err.errorFields[0].errors[0])
        })
    }

    const columns = [
      {
        title: t('商品名称'),
        dataIndex: 'name',
        key: 'name',
        width: 180,
        render: (text: string) => <TableTextOverflow text={text} />,
      },
      {
        title: t('所属报价单'),
        dataIndex: 'quotation',
        key: 'quotation',
        width: 180,
        render: (text: string) => (
          <div>
            <TableTextOverflow text={text} />
          </div>
        ),
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('商品单价')}
          </>
        ),
        key: 'totalPrice',
        dataIndex: 'totalPrice',
        width: 450,
        render: (text: string) => t(`${text}元`),
      },
      {
        title: t('商品数量'),
        dataIndex: 'base_unit_id',
        key: 'base_unit_id',
        width: 110,
        render: (text: string) => {
          const unitName = globalStore.getUnitName(text) || ''
          return unitName ? `1${unitName}` : '-'
        },
      },
    ]

    const expandedRowRender = (data: BoundCombineDataType) => {
      const expandedColumns = [
        { title: '', width: 20, render: () => '' },
        {
          title: t('商品名称'),
          dataIndex: 'name',
          key: 'name',
          width: 180,
          render: (text: string) => <TableTextOverflow text={text} />,
        },
        {
          title: t('所属报价单'),
          key: 'sku_id',
          width: 180,
          render: () => '',
        },
        {
          title: t('商品单价'),
          key: 'price',
          dataIndex: 'price',
          width: 450,
          render: (text: string, record: BoundCombineChildrenType) => (
            <div>
              {record.isBound ? (
                t(`${text}元/${record.priceUnitName}`)
              ) : (
                <Space>
                  <Form.Item
                    required
                    rules={[
                      {
                        required: true,
                        message: t('请将所有商品单价填写完整'),
                      },
                      { validator: priceValidator },
                    ]}
                    name={[`${record.sku_id}_${record.quotation_id}`, 'price']}
                  >
                    <InputNumber
                      addonBefore='￥'
                      min={0}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  <span>/</span>
                  <Form.Item
                    required
                    rules={[
                      {
                        required: true,
                        message: t('请将所有商品单价填写完整'),
                      },
                      { validator: priceValidator },
                    ]}
                    name={[
                      `${record.sku_id}_${record.quotation_id}`,
                      'fee_unit_price',
                      'unit_id',
                    ]}
                  >
                    <Select value={text} style={{ width: 150 }}>
                      {_.map(record.priceUnitList, (item) => {
                        return (
                          <Option key={item.unit_id} value={item.unit_id}>
                            {item.text}
                          </Option>
                        )
                      })}
                    </Select>
                  </Form.Item>
                </Space>
              )}
            </div>
          ),
        },
        {
          title: t('商品数量'),
          dataIndex: 'ratio',
          key: 'ratio',
          width: 100,
          render: (text: string, record: BoundCombineChildrenType) => (
            <div>{t(`${text}${record.orderUnitName.split('（')[0]}`)}</div>
          ),
        },
      ]

      return (
        <div className='merchandise-ant-form-table'>
          <Table<BoundCombineChildrenType>
            rowClassName='table-expandedRow-color'
            key='sku_id'
            rowKey='sku_id'
            dataSource={data.items}
            columns={expandedColumns as any[]}
            showHeader={false}
            pagination={false}
          />
        </div>
      )
    }

    return (
      <Modal
        title={t('关联报价单')}
        visible={isShow}
        style={{ top: 20 }}
        bodyStyle={{ margin: '0px 16px', padding: '16px 16px 0 16px' }}
        width={1250}
        onCancel={handleCancel}
        footer={[
          <Button key='cancel' onClick={handleCancel}>
            {t('取消')}
          </Button>,
          <Button
            key='confirm'
            type='primary'
            loading={submitLoading}
            onClick={handleOk}
          >
            {t('确定')}
          </Button>,
        ]}
      >
        <Form
          form={boundCombineForm}
          scrollToFirstError
          validateTrigger='onFinish'
          onValuesChange={onValueChange}
        >
          <Table<BoundCombineDataType>
            columns={columns}
            key='quotation_id'
            rowKey='quotation_id'
            scroll={{ y: 'calc(100vh - 350px)' }}
            expandable={{
              expandedRowRender,
              defaultExpandAllRows: true,
            }}
            pagination={false}
            dataSource={boundTableList}
          />
        </Form>
      </Modal>
    )
  }),
)
export default QuotationTable
