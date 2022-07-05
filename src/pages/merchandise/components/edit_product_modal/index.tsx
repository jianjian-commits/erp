/* eslint-disable promise/no-nesting */
import React, {
  useState,
  useImperativeHandle,
  RefObject,
  useEffect,
  useRef,
} from 'react'
import {
  Table,
  Select,
  InputNumber,
  Modal,
  Button,
  Form,
  Row,
  Radio,
  message,
  Space,
  Input,
  Tooltip,
  Popover,
  Dropdown,
  Menu,
} from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { ColumnType } from 'antd/lib/table'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import '@/pages/merchandise/style.less'
import {
  getRandomId,
  getFilterPriceUnits,
  getMinOrderNumberUnit,
  priceValidator,
  getValidator,
} from '@/pages/merchandise/util'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import _, { flatten } from 'lodash'
import { INPUT_NUMBER_CONFIG } from '@/common/constants'
import EditProductTitle from '@/pages/merchandise/components/reference_price/edit_product_title'
import ReferencePrice from '@/pages/merchandise/components/reference_price/reference_price'
import {
  BasicPriceItem_PRICINGFORMULA,
  BasicPriceItem_PRICINGTYPE,
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Quotation_Type,
  Sku,
} from 'gm_api/src/merchandise'
import SyncPriceItem, {
  SyncPriceItemlRef,
} from '@/pages/merchandise/components/sync_price_item'
import FormulartModal, {
  FormularlRef,
  PresetFormValues,
} from '@/pages/merchandise/components/formular_modal/formular_modal'
import { formatFormula } from '@/common/components/formula/calculator'
import SelectUnit from '@/pages/merchandise/components/select_unit'
import store, { SubView } from './store'
import { Observer, observer } from 'mobx-react'
import './index.less'
import ProductPriceChart from './chart/index'
import ReferencePriceMap from '@/pages/merchandise/price_manage/customer_quotation/components/reference_price_map'
import Filter from '@/svg/filter.svg'

interface EditProductModalProps {
  modalRef: RefObject<EditProductModalRef>
  sku: Sku
  quotation: Quotation
  /** 最近报价|最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices
  onSubmit: (
    data: ChildrenType[],
    skuId: string,
    quotationId: string,
  ) => Promise<any>
}

export interface EditProductModalRef {
  handleOpen: (record: DataType) => void
}

const EditProductModal = (props: EditProductModalProps) => {
  const [form] = Form.useForm()
  const { modalRef, sku, quotation, onSubmit, priceOf } = props

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('报价单名称')
  const [data, setData] = useState<ChildrenType[]>([])
  const [record, setRecord] = useState<ChildrenType | undefined>(undefined)

  /** 当前条目index，用于定价公式 */
  const [editIndex, setEditIndex] = useState<number>(NaN)
  /** 已选择的下单单位 */
  const selectedUnitsRef = useRef<string[]>([])

  /** 同步商品价格和定价公式 */
  const syncPriceRef = useRef<SyncPriceItemlRef>(null)
  /** 设置定价公式 */
  const formularModalRef = useRef<FormularlRef>(null)

  // 表格红色边框
  const isWaring = false

  useEffect(() => {
    store.getCombineList(quotation)
    return () => handleCancel()
  }, [])

  useImperativeHandle(
    modalRef,
    (): EditProductModalRef => ({
      handleOpen,
    }),
  )

  /** 打开弹窗 */
  const handleOpen = (record: DataType) => {
    const { name, items, type } = record
    setTitle(name)
    setData(_.cloneDeep(items.slice()) || [])
    setVisible(true)
    updateSelectUnitList(items)
  }

  /** 点击取消 */
  const handleCancel = () => {
    setVisible(false)
    setData([])
    setTitle('')
    store.view = undefined
    selectedUnitsRef.current = []
  }

  /** 增加一行 */
  const handleAdd = () => {
    if (data.length === 0) return
    const defaultData = {
      id: getRandomId(),
      order_unit_id: '',
      minimum_order_number: '0.01',
      fee_unit_price: {
        unit_id: '',
        val: '',
      },
      on_shelf: true,
      units: data[0].units,
      current_price: false,
    }
    data.push(defaultData)
    setData([...data])
    updateSelectUnitList(data)
  }

  /** 删除行 */
  const handleDeleteRow = (id: string) => {
    if (data.length <= 1) {
      message.warn('至少保留一条报价条目')
      return
    }
    const newData = [...data.filter((f) => f.id !== id)]
    setData(newData)
    updateSelectUnitList(newData)
  }

  /** 同步 */
  const handleSyncRow = (record: ChildrenType) => {
    syncPriceRef.current && syncPriceRef.current.handleOpenSync(record)
  }

  /** 同步价格 */
  const syncPrice = (
    newPriceList: ChildrenType[],
    newFieldsValue: { [key: string]: any },
  ) => {
    const oldFieldsValue = form.getFieldsValue()
    setData(newPriceList)
    form.setFieldsValue({
      ...oldFieldsValue,
      ...newFieldsValue,
    })
    updateSelectUnitList(newPriceList)
    message.success(t('复制成功'))
  }

  /** 编辑行 */
  const handleEditRow = (
    key: keyof ChildrenType,
    value: ChildrenType[keyof ChildrenType],
    index: number,
  ) => {
    data[index][key] = value
    setData([...data])
    updateSelectUnitList(data)
  }

  /** 编辑定价公式 */
  const editFormulaText = (index: number, formula_text?: string) => {
    console.log(formula_text, 'formula_text')
    if (formularModalRef.current) {
      setEditIndex(index)
      formularModalRef.current.setInitialFormula(formula_text || '')
      formularModalRef.current.handleOpen('preset')
    }
  }

  /** 确定定价公式 */
  const handlePresetOK = (
    presetValue: PresetFormValues,
    onClose: (...args: any) => any,
  ) => {
    const { formula_text, pricing_formula } = presetValue
    const newDataItem = {
      ...data[editIndex],
      pricing_formula,
      pricing_type: BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL,
      formula_text:
        pricing_formula === BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE
          ? ''
          : formula_text,
    }

    data[editIndex] = newDataItem
    setData([...data])
    updateSelectUnitList(data)

    onClose()
  }

  const updateSelectUnitList = (data: ChildrenType[]) => {
    const selectUnitList = data
      .map((item) => item.order_unit_id)
      .filter(Boolean)
    selectedUnitsRef.current = selectUnitList as string[]
  }

  const columns: ColumnType<ChildrenType>[] = [
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('价格类型')}
        </>
      ),
      dataIndex: 'current_price',
      key: 'current_price',
      width: 150,
      render: (_, row, index) => {
        const { current_price, id, fee_unit_price, order_unit_id } = row
        return (
          <Form.Item
            id={'current_price' + id + index}
            name={'current_price' + id + index}
            rules={[
              { required: true, message: t('请选择价格类型') },
              {
                validator(rule, value, cb) {
                  if (!value) return Promise.resolve()
                  const ingredients = flatten(
                    store.list.map((s) => s.ingredients?.ingredients || []),
                  )
                  const exist = ingredients.find(
                    (item) =>
                      item.order_unit_id === order_unit_id &&
                      item.sku_id === sku.sku_id,
                  )
                  if (!exist) return Promise.resolve()
                  return Promise.reject(
                    new Error('商品已关联组合商品，不能修改为时价'),
                  )
                },
              },
            ]}
            initialValue={current_price ?? false}
          >
            <Select
              options={[
                { label: '非时价', value: false },
                { label: '时价', value: true },
              ]}
              placeholder={t('请选择')}
              value={current_price}
              style={{ width: 100 }}
              onChange={(value) => {
                handleEditRow('current_price', value, index)
                if (value) {
                  handleEditRow(
                    'fee_unit_price',
                    {
                      unit_id: fee_unit_price.unit_id,
                      val: '0',
                    },
                    index,
                  )
                  form.setFieldsValue({
                    ['unit_id' + id]: fee_unit_price.unit_id,
                    ['unit_id_val' + id]: '0',
                  })
                  handleEditRow('pricing_formula', undefined, index)
                  handleEditRow('pricing_type', undefined, index)
                  handleEditRow('formula_text', undefined, index)
                  handleEditRow('minimum_order_number', '0.01', index)
                }
              }}
            />
          </Form.Item>
        )
      },
    },
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('下单单位')}
        </>
      ),
      dataIndex: 'order_unit_id',
      key: 'order_unit_id',
      width: '150px',
      render: (_, record, index) => {
        const { id, units, order_unit_id, current_price } = record
        // 其他已选择单位
        const otherSelectedUnit = selectedUnitsRef.current.filter(
          (f) => f !== order_unit_id,
        )
        return (
          <Form.Item
            id={'order_unit_id' + id + index}
            name={'order_unit_id' + id + index}
            rules={[
              { required: true, message: t('请选择下单单位') },
              { validator: priceValidator },
            ]}
            initialValue={order_unit_id}
          >
            <SelectUnit
              dropdownMatchSelectWidth={124}
              options={units.filter(
                (f) => !otherSelectedUnit.includes(f.value),
              )}
              placeholder={t('请选择')}
              value={order_unit_id}
              onChange={(val) => {
                // 重新选择下单单位时，定价价格和单位也要清空
                handleEditRow('order_unit_id', val, index)
                handleEditRow(
                  'fee_unit_price',
                  {
                    unit_id: val,
                    val: '0',
                  },
                  index,
                )
                form.setFieldsValue({
                  ['unit_id' + record.id]: val,
                  ['unit_id_val' + record.id]: '0',
                })
                form.validateFields()
              }}
              style={{ width: 100 }}
            />
          </Form.Item>
        )
      },
    },
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('商品单价')}
        </>
      ),
      key: 'fee_unit_price',
      width: '300px',
      dataIndex: 'fee_unit_price',
      render: (_, record, index) => {
        const {
          order_unit_id,
          units,
          id,
          fee_unit_price,
          current_price,
          parentId,
        } = record
        /** 当前下单单位 */
        const currentUnit = units.find((f) => f.value === order_unit_id)
        const price = current_price ? '0' : Number(fee_unit_price.val || 0)
        return (
          <Row wrap={false} style={{ lineHeight: '32px' }}>
            <Form.Item
              id={'unit_id_val' + id}
              name={'unit_id_val' + id}
              rules={[
                {
                  validator: !current_price
                    ? getValidator(['nonNegative'])
                    : undefined,
                },
              ]}
              initialValue={price}
            >
              <InputNumber
                min={0}
                addonBefore='¥'
                placeholder={t('请输入')}
                max={9999999999}
                style={{ width: 120 }}
                disabled={current_price}
                value={price}
                onChange={(val) =>
                  handleEditRow(
                    'fee_unit_price',
                    {
                      unit_id: fee_unit_price.unit_id,
                      val,
                    },
                    index,
                  )
                }
              />
            </Form.Item>
            <span>/</span>
            <Form.Item
              id={'unit_id' + id}
              name={'unit_id' + id}
              rules={[{ required: true, message: t('请选择') }]}
              initialValue={fee_unit_price.unit_id}
            >
              <Select
                options={getFilterPriceUnits(units, currentUnit)}
                style={{ width: 100 }}
                placeholder={t('请选择')}
                disabled={!order_unit_id || current_price}
                value={fee_unit_price.unit_id}
                onChange={(value) => {
                  handleEditRow(
                    'fee_unit_price',
                    {
                      unit_id: value,
                      val: fee_unit_price.val,
                    },
                    index,
                  )
                }}
              />
            </Form.Item>
            <div
              id={`ReferencePriceMap-edit_product_modal-${priceOf}-${parentId}-${fee_unit_price.unit_id}-${order_unit_id}`}
              className='tw-inline-flex tw-items-center'
            />
          </Row>
        )
      },
    },
    {
      title: (
        <div className='tw-flex tw-items-center tw-justify-between'>
          <span>
            {(() => {
              switch (priceOf) {
                case 'in_stock_reference_prices':
                  return '最近入库价'
                case 'purchase_reference_prices':
                  return '最近采购价'
                case 'quotation_reference_prices':
                  return '最近报价'
                default:
                  return '-'
              }
            })()}
          </span>
          <Dropdown
            trigger='click'
            overlay={
              <Menu selectedKeys={[priceOf]}>
                {[
                  {
                    key: 'quotation_reference_prices',
                    label: '最近报价',
                  },
                  {
                    key: 'purchase_reference_prices',
                    label: '最近采购价',
                  },
                  {
                    key: 'in_stock_reference_prices',
                    label: '最近入库价',
                  },
                ].map((item) => {
                  return (
                    <Menu.Item
                      key={item.key}
                      onClick={() => {
                        dispatchEvent(
                          new CustomEvent('EDIT_PRODUCT_MODAL|PRICEOF_CHANGE', {
                            detail: item.key,
                          }),
                        )
                      }}
                    >
                      {item.label}
                    </Menu.Item>
                  )
                })}
              </Menu>
            }
          >
            <span className='b-framework-info-down hover:tw-bg-gray-200 tw-cursor-pointer'>
              <Filter style={{ width: 16, height: 16 }} />
            </span>
          </Dropdown>
        </div>
      ),
      key: 'priceOf',
      width: 200,
      dataIndex: 'priceOf',
      render: (_, record) => {
        return (
          <Observer>
            {() => {
              if (record.items) return <span />
              const { fee_unit_price, units, order_unit_id, parentId } =
                record as ChildrenType
              return (
                <>
                  <ReferencePriceMap
                    quotation={quotation}
                    list={[
                      {
                        sku_id: sku.sku_id,
                        // uint64 unit_id        = 2; // 商品单价单位 fee_unit_id.unit_id
                        // uint64 order_unit_id  = 3; // 下单单位 order_unit_id
                        unit_id: fee_unit_price.unit_id,
                        order_unit_id: order_unit_id,
                      },
                    ]}
                    type={priceOf}
                    record={{ ...record, parentId: sku.sku_id }}
                    arrowSelector={`#ReferencePriceMap-edit_product_modal-${priceOf}-${parentId}-${fee_unit_price.unit_id}-${order_unit_id}`}
                    onClickTrend={() => {
                      setRecord(record)
                      switch (priceOf) {
                        case 'quotation_reference_prices':
                          if (quotation.type === Quotation_Type.PERIODIC)
                            return (store.view = SubView.Reference)
                          else return (store.view = SubView.Reference2)
                        case 'purchase_reference_prices':
                          return (store.view = SubView.Purchase)
                        case 'in_stock_reference_prices':
                          return (store.view = SubView.StockIn)
                        default:
                      }
                    }}
                  />
                </>
              )
            }}
          </Observer>
        )
      },
    },
    {
      title: t('定价公式'),
      dataIndex: 'text',
      key: 'text',
      width: '180px',
      render: (_, record, index) => {
        const { formula_text, pricing_formula, current_price } = record
        let formulaText =
          pricing_formula === BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE
            ? ''
            : formatFormula(formula_text)
        if (current_price) formulaText = ''

        return (
          <Tooltip trigger='hover' mouseEnterDelay={0.3} overlay={formulaText}>
            <Form.Item>
              <Input
                disabled={current_price}
                value={formulaText}
                onClick={() => editFormulaText(index, formula_text)}
              />
            </Form.Item>
          </Tooltip>
        )
      },
    },
    {
      title: t('最小起订数'),
      dataIndex: 'minimum_order_number',
      key: 'minimum_order_number',
      width: '160px',
      render: (_, record, index) => {
        const { units, minimum_order_number, order_unit_id, current_price } =
          record
        const value = Number(minimum_order_number || 0.01)
        return (
          <>
            <InputNumber
              min={0.01}
              {...INPUT_NUMBER_CONFIG}
              disabled={current_price}
              value={value}
              onChange={(val) =>
                handleEditRow('minimum_order_number', val || 0.01, index)
              }
            />
            {getMinOrderNumberUnit(units, order_unit_id)}
          </>
        )
      },
    },
    {
      title: t('状态'),
      dataIndex: 'on_shelf',
      key: 'on_shelf',
      width: '170px',
      render: (_, record, index) => (
        <Radio.Group
          name='radiogroup'
          value={record.on_shelf}
          onChange={(e) => handleEditRow('on_shelf', e.target.value, index)}
        >
          <Radio value>{t('上架')}</Radio>
          <Radio value={false}>{t('下架')}</Radio>
        </Radio.Group>
      ),
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      render: (_, record) => {
        const {
          fee_unit_price: { unit_id },
        } = record
        const canShowCopy =
          unit_id === sku.base_unit_id || unit_id === sku.second_base_unit_id
        return (
          <Space>
            <a onClick={() => handleDeleteRow(record.id)}>{t('删除')}</a>
            {data.length > 1 && canShowCopy && (
              <a onClick={() => handleSyncRow(record)}>{t('复制')}</a>
            )}
          </Space>
        )
      },
    },
  ]

  /** 提交 */
  const handleSubmit = () => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        onSubmit(data, sku.sku_id, quotation.quotation_id)
          .then(() => {
            message.success('编辑成功')
            handleCancel()
          })
          .finally(() => setLoading(false))
      })
      .catch((err) => {
        message.error(t(err.errorFields[0].errors[0]))
      })
  }

  return (
    <Modal
      title={<EditProductTitle name={title} quotationType={quotation.type} />}
      style={{ top: 30 }}
      visible={visible}
      confirmLoading={loading}
      maskClosable={false}
      width={1080}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText='确认'
      cancelText='取消'
      destroyOnClose
      footer={store.view ? null : undefined}
    >
      {(() => {
        switch (store.view) {
          case undefined:
            return (
              <>
                <Form
                  className={classNames({
                    'expanded-row-render-table-warning': isWaring,
                    'merchandise-ant-form-table': true,
                  })}
                  form={form}
                  preserve={false}
                >
                  <Table
                    className='edit-product-table'
                    rowKey='id'
                    rowClassName='tw-bg-white'
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    scroll={{ y: 400 }}
                  />
                </Form>

                {data.length < 20 && (
                  <Button
                    type='link'
                    onClick={handleAdd}
                    icon={<PlusCircleOutlined />}
                  >
                    {t('增加一行')}
                  </Button>
                )}
              </>
            )
          case SubView.Reference:
            return (
              <ReferencePrice
                quotationId={quotation.quotation_id}
                skuId={sku.sku_id}
              />
            )
          case SubView.Reference2:
            return (
              <ProductPriceChart
                type='quotation_reference_prices'
                quotation={quotation}
                sku_unit_filter={{
                  sku_id: sku.sku_id,
                  order_unit_id: record?.fee_unit_price?.unit_id!,
                  unit_id: record?.order_unit_id!,
                }}
              />
            )
          case SubView.Purchase:
            return (
              <ProductPriceChart
                type='purchase_reference_prices'
                quotation={quotation}
                sku_unit_filter={{
                  sku_id: sku.sku_id,
                  order_unit_id: record?.fee_unit_price?.unit_id!,
                  unit_id: record?.order_unit_id!,
                }}
              />
            )
          case SubView.StockIn:
            return (
              <ProductPriceChart
                type='in_stock_reference_prices'
                quotation={quotation}
                sku_unit_filter={{
                  sku_id: sku.sku_id,
                  order_unit_id: record?.fee_unit_price?.unit_id!,
                  unit_id: record?.order_unit_id!,
                }}
              />
            )
        }
      })()}

      <SyncPriceItem
        modalRef={syncPriceRef}
        priceList={data}
        syncPrice={syncPrice}
        sku={sku!}
      />
      <FormulartModal
        hidePricingType
        modalRef={formularModalRef}
        handlePresetOK={handlePresetOK}
      />
    </Modal>
  )
}

export default observer(EditProductModal)
