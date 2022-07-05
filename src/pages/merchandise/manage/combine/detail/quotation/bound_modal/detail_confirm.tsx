import React, { FC, forwardRef, useEffect, useImperativeHandle } from 'react'
import { observer } from 'mobx-react'
import { Table, InputNumber, Form, Space, Select } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  QuotaionProps,
  BoundCombineChildrenType,
  BoundCombineDataType,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import globalStore, { UnitGlobal } from '@/stores/global'
import store from './store'
import { handleScrollIntoView, priceValidator } from '@/pages/merchandise/util'
import TableTextOverflow from '@/common/components/table_text_overflow'

const { Option } = Select

const DetailConfirm = observer(
  forwardRef<QuotaionProps, any>((props, quotionRef) => {
    const { boundTableList, setBoundListTotalPrice, boundFormFields } = store
    const [boundCombineForm] = Form.useForm()

    useImperativeHandle(quotionRef, () => ({
      handleVerify,
    }))

    useEffect(() => {
      boundCombineForm.setFieldsValue(boundFormFields)
    }, [boundFormFields])

    const onValueChange = (values: any, allValues: any) => {
      const keys = _.keys(values)
      const lineValue = allValues[keys[0]]
      if (lineValue.price && lineValue.fee_unit_price.unit_id) {
        setBoundListTotalPrice({ [keys[0]]: allValues[keys[0]] })
      }
    }

    /** 提交校验 */
    const handleVerify = async () => {
      // 使scrollToFirstError生效
      boundCombineForm.submit()
      return await boundCombineForm
        .validateFields()
        .then((values) => {
          return values
        })
        .catch((err) => {
          const { errorFields } = err
          const id = errorFields[0].name.join('_')
          handleScrollIntoView(id)
          return err
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
        render: (text: string) => <TableTextOverflow text={text} />,
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
        render: (text: string, record: BoundCombineDataType) => {
          const unitName = globalStore.getUnitName(record.base_unit_id) || ''
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
                    name={[`${record.sku_id}_${data.quotation_id}`, 'price']}
                  >
                    <InputNumber
                      addonBefore='￥'
                      min={0}
                      style={{ width: 200 }}
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
                    <Select value={text} style={{ width: 200 }}>
                      {_.map(record.priceUnitList, (item: UnitGlobal) => (
                        <Option key={item.unit_id} value={item.unit_id}>
                          {item.text}
                        </Option>
                      ))}
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
      <Form
        form={boundCombineForm}
        scrollToFirstError
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
    )
  }),
)
export default DetailConfirm
