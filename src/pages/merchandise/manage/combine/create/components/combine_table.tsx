import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  Table,
  Row,
  Col,
  Select,
  Space,
  message,
  InputNumber,
  Form,
  Button,
} from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { PlusCircleOutlined, CopyOutlined } from '@ant-design/icons'
import { ListType, TableRefProps, BatchRefProps } from '../interface'
import classNames from 'classnames'
import store, { TableConfigInterface } from '../store'
import _ from 'lodash'
import { Ingredient, ListSkuV2, Sku, Sku_SkuType } from 'gm_api/src/merchandise'
import { getSkuUnitList } from '@/pages/merchandise/manage/combine/util'
import { handleScrollIntoView } from '@/pages/merchandise/util'
import BatchImportModal from './batch_import_modal'
import globalStore from '@/stores/global'

const { Option } = Select
const CombineTableComponent = observer(
  forwardRef<TableRefProps, any>((props, tableRef) => {
    const {
      tableErrorTip,
      tableFormConfig,
      tableSkuList,
      addTableFormConfigItem,
      deleteTableFormConfigItem,
      setTableFormConfigItem,
      addTableSkuListItem,
      deleteTableSkuListItem,
      setTableSkuListItem,
      setTableErrorTip,
    } = store

    const [form] = Form.useForm()

    const searchTimerRef = useRef<NodeJS.Timer | null>(null)
    const modalRef = useRef<BatchRefProps>(null)

    const [defaultSelectedRows, setDefaultSelectedRows] = useState<Sku[]>([])
    const [defaultSelectedRowKeys, setDefaultSelectedRowsKeys] = useState<
      string[]
    >([])

    useImperativeHandle(tableRef, () => ({
      handleFinish,
      setFieldsValue,
    }))

    /** 删除商品 */
    const handleDelete = async (index: number) => {
      if (tableFormConfig.length <= 1) {
        return
      }
      const skuValue = await _.cloneDeep(form.getFieldsValue().sku)
      skuValue.splice(index, 1)
      form.setFieldsValue({ sku: skuValue })
      deleteTableFormConfigItem(index)
      deleteTableSkuListItem(index)
    }

    /** 组成商品校验 */
    const skuValidator = (event: any, value: string) => {
      if (!value) {
        return Promise.reject(new Error(t('请选择商品')))
      }
      const formValue = form.getFieldsValue()
      const skus = _.filter(
        formValue.sku,
        (skuItem) => skuItem.sku_id === value,
      )
      if (skus && skus.length > 1) {
        return Promise.reject(
          new Error(t('同一组合商品中不能包含多个相同子商品')),
        )
      }
      return Promise.resolve(new Error())
    }

    /** 下单数量校验 */
    const ratioValidator = (event: any, value: number) => {
      const reg = /^(\d+)(.\d{0,4})?$/

      if (!reg.test(value + '') || value <= 0) {
        return Promise.reject(
          new Error(t('下单数量必须为大于0，小数点后至多四位的数值')),
        )
      } else {
        return Promise.resolve(new Error())
      }
    }

    /** 获取商品列表 */
    const getSkuList = (value: string, index: number) => {
      ListSkuV2({
        filter_params: {
          q: value,
          sku_type: Sku_SkuType.NOT_PACKAGE,
        },
        paging: {
          offset: 0,
          limit: 999,
        },
      }).then((json) => {
        const skus = json.response.skus || []
        setTableFormConfigItem('skuOptions', skus, index)
      })
    }

    /** 查询商品 */
    const handleSearchSku = (value: string, index: number) => {
      console.log(value)
      if (value) {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current as NodeJS.Timer)
          searchTimerRef.current = null
        }
        searchTimerRef.current = setTimeout(() => {
          getSkuList(value, index)
        }, 500)
      }
    }

    /** 修改商品 */
    const handleChangeSku = (value: any, index: number) => {
      const sku: Sku | undefined = _.find(
        tableFormConfig[index].skuOptions,
        (item) => {
          return item.sku_id === value
        },
      )
      if (sku) {
        // 获取可选下单单位
        const unitList = getSkuUnitList(sku)
        setTableSkuListItem(index, sku)
        setTableFormConfigItem('unitList', unitList, index)
        setTableFormConfigItem('on_sale', !!sku.on_sale, index)

        const skuValue = _.cloneDeep(form.getFieldValue('sku'))
        skuValue[index] = {
          sku_id: value,
          order_unit_id: sku.base_unit_id,
          ratio: undefined,
        }

        setTableFormConfigItem(
          'unitName',
          globalStore.getUnitName(sku.base_unit_id),
          index,
        )

        form.setFieldsValue({ sku: skuValue })
      }
    }

    /** 修改下单单位 */
    const handleChangeUnit = (value: any, index: number) => {
      // 获取单位名称
      const unit = _.find(tableFormConfig[index].unitList, (unitItem) => {
        return unitItem.unit_id === value
      })
      if (unit) {
        setTableFormConfigItem('unitName', unit?.text, index)
      }
    }

    /** 保存 */
    const handleFinish = async (): Promise<Record<string, any>> => {
      if (tableFormConfig.length < 2) {
        return { errorFields: [{ errors: ['商品数不得小于2'] }] }
      }
      setTableErrorTip('')
      const result = await form
        .validateFields()
        .then((values) => {
          return values
        })
        .catch((err) => {
          const id = err.errorFields[0].name.join('_')
          handleScrollIntoView(id)
          return err
        })
      return result
    }

    /** 设置表单数据 */
    const setFieldsValue = (values: Ingredient[]) => {
      form.setFieldsValue({ sku: values })
    }

    /** 添加商品 */
    const handleAdd = () => {
      if (tableFormConfig.length === 10) {
        message.warning(t('最多添加十个商品'))
        return
      }
      addTableFormConfigItem()
      addTableSkuListItem()
    }

    /** 批量添加商品 */
    const handleBatchMerchandise = () => {
      if (tableFormConfig.length === 10) {
        message.warning(t('最多添加十个商品'))
        return
      }
      const sku = form.getFieldValue('sku')
      const keyList: string[] = []
      _.forEach(sku, (skuItem) => {
        if (skuItem?.sku_id) {
          keyList.push(skuItem.sku_id)
        }
      })
      setDefaultSelectedRowsKeys(keyList)

      const rowList = _.filter(tableSkuList, (rowItem) => {
        return rowItem && rowItem.sku_id
      })

      setDefaultSelectedRows(_.cloneDeep(rowList) as Sku[])

      modalRef.current && modalRef.current.setIsModalVisible(true)
    }

    /** 底部操作按钮 */
    const footer = () => {
      return (
        <Space size='middle'>
          <span className='footer-color' onClick={handleAdd}>
            <PlusCircleOutlined className='tw-mr-1' />
            {t('添加一行')}
          </span>
          <span style={{ color: '#777777' }}>|</span>
          <span className='footer-color' onClick={handleBatchMerchandise}>
            <CopyOutlined className='tw-mr-1' />
            {t('批量添加商品')}
          </span>
          <BatchImportModal
            defaultSelectedRowKeys={defaultSelectedRowKeys}
            defaultSelectedRows={defaultSelectedRows}
            setFieldsValue={setFieldsValue}
            fieldsValue={form.getFieldsValue()}
            ref={modalRef}
          />
        </Space>
      )
    }

    const columns = [
      {
        title: (
          <>
            <span className='gm-text-red'>*</span> <span>{t('商品名称')}</span>
          </>
        ),
        key: 'sku_id',
        render: (text: string, record: ListType, index: number) => (
          <Form.Item
            rules={[
              { required: true, message: t('请选择商品') },
              { validator: skuValidator },
            ]}
            name={['sku', index, 'sku_id']}
          >
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder={t('请选择商品')}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              value={String(text)}
              onSearch={(value) => handleSearchSku(value, index)}
              onChange={(value) => handleChangeSku(value, index)}
              notFoundContent={null}
            >
              {_.map(record.skuOptions, (item) => {
                return (
                  <Option key={item.sku_id} value={item.sku_id}>
                    {item.name}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>
        ),
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span> <span>{t('下单单位')}</span>
          </>
        ),
        key: 'order_unit_id',
        render: (text: string, record: ListType, index: number) => (
          <>
            <Form.Item
              rules={[{ required: true, message: t('请输入下单单位') }]}
              name={['sku', index, 'order_unit_id']}
            >
              <Select
                value={text}
                style={{ width: 200 }}
                onChange={(value) => handleChangeUnit(value, index)}
              >
                {_.map(record.unitList, (item) => {
                  return (
                    <Option key={item.unit_id} value={item.unit_id}>
                      {item.text}
                    </Option>
                  )
                })}
              </Select>
            </Form.Item>
          </>
        ),
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span> <span>{t('下单数量')}</span>
          </>
        ),
        key: 'ratio',
        render: (text: string, record: ListType, index: number) => (
          <Form.Item
            rules={[
              { required: true, message: t('请填写下单数量') },
              { validator: ratioValidator },
            ]}
            name={['sku', index, 'ratio']}
          >
            <InputNumber
              value={Number(text)}
              style={{ width: 200 }}
              max={9999999999}
              addonAfter={record.unitName?.split('（')[0]}
            />
          </Form.Item>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        render: (text: any, record: ListType, index: number) => {
          return (
            <Button
              type='link'
              style={{ border: 'none', background: '#FFF' }}
              disabled={tableFormConfig.length === 1}
              onClick={() => handleDelete(index)}
            >
              {t('删除')}
            </Button>
          )
        },
      },
    ]

    return (
      <Row style={{ maxWidth: 1200 }}>
        <Col
          className='tw-text-right tw-mt-1'
          xs={6}
          sm={6}
          md={4}
          lg={3}
          xl={3}
        >
          <span className='gm-text-red tw-mr-1'>*</span>
          <span>{t('组合明细：')}</span>
        </Col>
        <Col xs={18} sm={18} md={20} lg={20} xl={21}>
          <Form
            form={form}
            className='merchandise-ant-form-table'
            style={{ overflowX: 'scroll' }}
          >
            <Table<TableConfigInterface>
              className={classNames(
                tableErrorTip ? 'table-danger-border' : 'table-nomoral-border',
              )}
              dataSource={toJS(tableFormConfig)}
              columns={columns as any[]}
              pagination={false}
              rowKey={(record) => record.key}
              footer={() => footer()}
            />
          </Form>
          {tableErrorTip && (
            <span className='gm-text-red'>{t(tableErrorTip)}</span>
          )}
        </Col>
      </Row>
    )
  }),
)
export default CombineTableComponent
