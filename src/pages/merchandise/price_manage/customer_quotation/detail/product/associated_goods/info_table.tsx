/* eslint-disable promise/no-nesting */
import React, { useState, useRef, useEffect } from 'react'
import {
  Table,
  InputNumber,
  Select,
  message,
  Button,
  Modal,
  Form,
  Row,
  Space,
  Input,
} from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import '../../style.less'
import { PlusCircleOutlined } from '@ant-design/icons'
import store from './store'
import { ColumnType } from 'antd/lib/table'
import {
  BasicPriceItem_PRICINGFORMULA,
  BasicPriceItem_PRICINGTYPE,
  Sku,
} from 'gm_api/src/merchandise'
import {
  getRandomId,
  handleScrollIntoView,
  getUnitGroupList,
  getFilterPriceUnits,
  getMinOrderNumberUnit,
  priceValidator,
  getValidator,
} from '@/pages/merchandise/util'
import baseStore from '../../store'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import '@/pages/merchandise/style.less'
import productStore from '../store'
import { INPUT_NUMBER_CONFIG } from '@/common/constants'
import '../style.less'
import _ from 'lodash'
import SyncPriceItem, {
  SyncPriceItemlRef,
} from '@/pages/merchandise/components/sync_price_item'
import FormulartModal, {
  FormularlRef,
  PresetFormValues,
} from '@/pages/merchandise/components/formular_modal/formular_modal'
import { parseFormula } from '@/common/components/formula/calculator'
import SelectUnit from '@/pages/merchandise/components/select_unit'

interface InfoTableProps {
  prev: () => void
  handleClose: () => void
}

// fee_unit_price val 初始值
const PRICE_INIT_VALUE = '1'

/** 商品信息转换成 */
const formatSkusToDataSource = (skus: Sku[]): DataType[] => {
  return skus.map((item, index) => {
    const { sku_id, name, customize_code, base_unit_id } = item
    const basic_price = productStore.list.find((item) => item.sku_id === sku_id)
    const current_price = basic_price?.items?.[0]?.current_price ?? false
    return {
      id: sku_id,
      name,
      customize_code,
      items: [
        {
          id: getRandomId() + index + sku_id,
          order_unit_id: base_unit_id,
          minimum_order_number: '0.01',
          fee_unit_price: {
            val: PRICE_INIT_VALUE,
            unit_id: base_unit_id,
          },
          units: getUnitGroupList(item),
          on_shelf: true,
          current_price,
        },
      ],
    }
  })
}

const formatDataSourceToSkus = (dataSource: DataType[]) => {
  return dataSource.map((item) => {
    return {
      sku_id: item.id,
      quotation_id: baseStore.quotation_id,
      items: {
        basic_price_items: item.items.map((m) => ({
          order_unit_id: Number(m.order_unit_id),
          minimum_order_number: String(m.minimum_order_number),
          fee_unit_price: {
            val: String(m.fee_unit_price.val || '0'),
            unit_id: m.fee_unit_price.unit_id,
          },
          on_shelf: true,
          pricing_formula: m.pricing_formula,
          pricing_type: m.pricing_type,
          formula_text: m.formula_text,
          current_price: m.current_price,
        })),
      },
    }
  })
}

/** 填写报价信息 */
const InfoTable = (props: InfoTableProps) => {
  const { prev, handleClose } = props
  const [form] = Form.useForm()
  const selectedUnitsRef = useRef<{ [key: string]: string[] }>({})

  const [dataSource, setDataSource] = useState<DataType[]>(
    formatSkusToDataSource(store.selectedRows),
  )
  const [loading, setLoading] = useState(false)

  /** 当前同步报价单价格条目 */
  const [syncPriceList, setSyncPriceList] = useState<ChildrenType[]>([])
  /** 当前同步的报价单index */
  const [syncIndex, setSyncIndex] = useState<number | undefined>(undefined)
  /** 当前条目index，用于定价公式 */
  const [editIndex, setEditIndex] = useState<number>(NaN)
  const [editRowIndex, setEditRowIndex] = useState<number>(NaN)
  /** 当前同步商品 */
  const [syncSku, setSyncSku] = useState<Sku>({
    sku_id: '',
    base_unit_id: '',
    name: '',
    customize_code: '',
    sku_type: 0,
    dispatch_type: 0,
    loss_ratio: '',
  })
  /** 同步商品价格和定价公式 */
  const syncPriceRef = useRef<SyncPriceItemlRef>(null)
  /** 设置定价公式 */
  const formularModalRef = useRef<FormularlRef>(null)

  useEffect(() => {
    dataSource.forEach((item) => {
      const { items, id } = item
      updateSelectUnitList(items, id)
    })
  }, [])

  /** 行数据改变 */
  const handleRowChange = (
    key: string,
    value: ChildrenType[keyof ChildrenType],
    index: number,
    rowIndex: number,
  ) => {
    const record = dataSource[index]
    const item = record.items[rowIndex]
    item[key] = value
    if (key === 'order_unit_id') {
      item.fee_unit_price = {
        val: '',
        unit_id: '',
      }
    }
    updateSelectUnitList(record.items, record.id)

    record.items = [...record.items]
    setDataSource([...dataSource])
  }

  /** 更新已选择的单位 */
  const updateSelectUnitList = (data: ChildrenType[], id: string) => {
    const selectUnitList = data
      .map((item) => item.order_unit_id)
      .filter(Boolean)
    selectedUnitsRef.current[id] = selectUnitList as string[]
  }

  // 增加字表行
  const handleAddRow = (record: DataType, index: number) => {
    record.items.splice(record.items.length, 0, {
      id: getRandomId() + index,
      order_unit_id: '',
      fee_unit_price: {
        val: '',
        unit_id: '',
      },
      minimum_order_number: '0.01',
      units: record.items[0].units,
      on_shelf: true,
      current_price: false,
    })
    // 触发渲染
    dataSource[index].items = [...dataSource[index]?.items]
    setDataSource([...dataSource])
  }

  // 删除字表行
  const handleDeleteRow = (
    record: DataType,
    rowIndex: number,
    index: number,
  ) => {
    if (record.items.length === 1) {
      message.warning(t('至少保留一条报价条目'))
      return
    }
    record.items.splice(rowIndex, 1)
    // 触发渲染
    dataSource[index].items = [...dataSource[index]?.items].slice()

    setDataSource([...dataSource])
    updateSelectUnitList(record.items, record.id)
  }

  /** 同步 */
  const handleSyncRow = async (
    items: ChildrenType[],
    item: ChildrenType,
    id: string,
  ) => {
    // console.log(items, item, id)
    const sku = _.find(store.selectedRows, (skuItem) => skuItem.sku_id === id)
    if (sku) {
      await setSyncSku(sku)
    }

    await setSyncPriceList(items)
    const index = _.findIndex(dataSource, (dataItem) => dataItem.id === id)
    setSyncIndex(index)
    syncPriceRef.current && syncPriceRef.current.handleOpenSync(item)
  }

  /** 同步价格 */
  const syncPrice = (
    newPriceList: ChildrenType[],
    newFieldsValue: { [key: string]: any },
  ) => {
    if (syncIndex !== undefined) {
      const newData = _.cloneDeep(dataSource)
      newData[syncIndex].items = newPriceList
      setDataSource(newData)
    }
    const oldFieldsValue = form.getFieldsValue()
    form.setFieldsValue({
      ...oldFieldsValue,
      ...newFieldsValue,
    })
    message.success(t('复制成功'))
  }

  /** 数据提交 */
  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)

        store
          .onSubmit(formatDataSourceToSkus(dataSource) as any)
          .then(() => {
            message.success('提交成功')
            productStore.fetchList(undefined, true)
            baseStore.getQuotation()
            onClose()
          })
          .finally(() => setLoading(false))
      })
      .catch((err) => {
        message.error(t(err.errorFields[0].errors[0]))
        const { errorFields } = err
        const id = errorFields[0].name
        handleScrollIntoView(id)
      })
  }

  const onCancel = () => {
    Modal.confirm({
      title: t('提示'),
      content: t('取消后已填写的信息将会失效，确定要离开？'),
      okText: t('继续填写'),
      cancelText: t('离开'),
      onCancel: () => {
        onClose()
      },
    })
  }

  const onClose = () => {
    if (typeof handleClose === 'function') {
      setLoading(false)
      handleClose()
    }
  }

  const onPrev = () => {
    Modal.confirm({
      title: t('提示'),
      content: t('返回上一步后已填写的信息将会失效，确定要离开？'),
      okText: t('继续填写'),
      cancelText: t('上一步'),
      onCancel: () => {
        if (typeof prev === 'function') prev()
      },
    })
  }

  /** 编辑定价公式 */
  const editFormulaText = (
    index: number,
    rowIndex: number,
    formula_text?: string,
  ) => {
    if (formularModalRef.current) {
      setEditIndex(index)
      setEditRowIndex(rowIndex)
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
    const basicPrice = _.cloneDeep(dataSource[editIndex])
    basicPrice.items[editRowIndex] = {
      ...basicPrice.items[editRowIndex],
      pricing_formula,
      pricing_type: BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL,
      formula_text:
        pricing_formula === BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE
          ? ''
          : formula_text,
    }

    dataSource[editIndex] = basicPrice

    setDataSource([...dataSource])

    onClose()
  }

  /** 子表 */
  const expandedRowRender = (record: DataType, index: number) => {
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
        width: 190,
        render: (_, row, rowIndex) => {
          const { current_price, id, fee_unit_price } = row
          return (
            <Form.Item
              id={'current_price' + id + rowIndex}
              name={'current_price' + id + rowIndex}
              rules={[{ required: true, message: t('请选择价格类型') }]}
              initialValue={current_price ?? false}
            >
              <Select
                options={[
                  { label: '非时价', value: false },
                  { label: '时价', value: true },
                ]}
                placeholder={t('请选择')}
                value={current_price}
                style={{ width: 120, marginLeft: 20 }}
                onChange={(value) => {
                  handleRowChange('current_price', value, index, rowIndex)
                  if (value) {
                    handleRowChange(
                      'fee_unit_price',
                      {
                        unit_id: fee_unit_price.unit_id,
                        val: '0',
                      },
                      index,
                      rowIndex,
                    )
                    form.setFieldsValue({
                      ['unit_id' + id]: fee_unit_price.unit_id,
                      ['unit_id_val' + id]: '0',
                    })
                    handleRowChange(
                      'pricing_formula',
                      undefined,
                      index,
                      rowIndex,
                    )
                    handleRowChange('pricing_type', undefined, index, rowIndex)
                    handleRowChange('formula_text', undefined, index, rowIndex)
                    handleRowChange(
                      'minimum_order_number',
                      '0.01',
                      index,
                      rowIndex,
                    )
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
        width: 200,
        render: (_, row, rowIndex) => {
          const { units, order_unit_id, id, current_price } = row
          // 其他已选择单位
          const otherSelectedUnit =
            selectedUnitsRef.current[record.id]?.filter(
              (f) => f !== order_unit_id,
            ) || []
          return (
            <Form.Item
              id={'order_unit_id' + id + rowIndex}
              name={'order_unit_id' + id + rowIndex}
              rules={[{ required: true, message: t('请选择下单单位') }]}
              initialValue={order_unit_id}
            >
              <SelectUnit
                dropdownMatchSelectWidth={124}
                options={units.filter(
                  (f) => !otherSelectedUnit.includes(f.value),
                )}
                placeholder={t('请选择')}
                value={order_unit_id}
                style={{ width: 120 }}
                onChange={(value) => {
                  handleRowChange('order_unit_id', value, index, rowIndex)
                  handleRowChange(
                    'fee_unit_price',
                    {
                      unit_id: value,
                      val: current_price ? '0' : PRICE_INIT_VALUE,
                    },
                    index,
                    rowIndex,
                  )
                  form.setFieldsValue({
                    ['unit_id' + id]: value,
                    ['unit_id_val' + id]: current_price
                      ? '0'
                      : PRICE_INIT_VALUE,
                  })
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
            {t('商品单价')}
          </>
        ),
        key: 'fee_unit_price',
        width: 260,
        dataIndex: 'fee_unit_price',
        render: (_, row, rowIndex) => {
          // 确定当前单位类型
          const { order_unit_id, units, id, fee_unit_price, current_price } =
            row

          const currentUnit = units.find((f) => f.value === order_unit_id)

          return (
            <Row wrap={false}>
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
                initialValue={PRICE_INIT_VALUE}
              >
                <InputNumber
                  min={0}
                  addonBefore='¥'
                  placeholder={t('请输入')}
                  max={9999999999}
                  style={{ width: 120 }}
                  value={Number(row.fee_unit_price.val || 0)}
                  disabled={current_price}
                  onChange={(value) =>
                    handleRowChange(
                      'fee_unit_price',
                      {
                        unit_id: fee_unit_price.unit_id,
                        val: value,
                      },
                      index,
                      rowIndex,
                    )
                  }
                />
              </Form.Item>

              <span>/</span>
              <Form.Item
                id={'unit_id' + id}
                name={'unit_id' + id}
                rules={[
                  {
                    required: !current_price,
                    message: t('请选择商品单价单位'),
                  },
                ]}
                initialValue={fee_unit_price.unit_id}
              >
                <Select
                  options={getFilterPriceUnits(units, currentUnit)}
                  style={{ width: 100 }}
                  disabled={!order_unit_id || current_price}
                  placeholder={t('请选择')}
                  onChange={(value) =>
                    handleRowChange(
                      'fee_unit_price',
                      {
                        unit_id: value,
                        val: fee_unit_price.val,
                      },
                      index,
                      rowIndex,
                    )
                  }
                />
              </Form.Item>
            </Row>
          )
        },
      },
      {
        title: t('定价公式'),
        dataIndex: 'formula_text',
        key: 'formula_text',
        width: 200,
        render: (_, record, rowIndex) => {
          const { formula_text, pricing_formula, current_price } = record
          const formulaText =
            pricing_formula ===
            BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE
              ? ''
              : parseFormula(formula_text)
                  .map((item) => item.content)
                  .join('') || ''
          return (
            <Form.Item>
              <Input
                disabled={current_price}
                value={formulaText}
                onClick={() => editFormulaText(index, rowIndex, formula_text)}
              />
            </Form.Item>
          )
        },
      },
      {
        title: t('最小起订数'),
        dataIndex: 'minimum_order_number',
        key: 'minimum_order_number',
        width: 250,
        render: (_, row, rowIndex) => {
          const { units, minimum_order_number, order_unit_id, current_price } =
            row

          return (
            <>
              <InputNumber
                min={0.01}
                {...(current_price ? {} : INPUT_NUMBER_CONFIG)}
                value={Number(minimum_order_number || 0.01)}
                disabled={current_price}
                onChange={(value) =>
                  handleRowChange(
                    'minimum_order_number',
                    value || 0.01,
                    index,
                    rowIndex,
                  )
                }
              />
              {getMinOrderNumberUnit(units, order_unit_id)}
            </>
          )
        },
      },

      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'left',
        render: (item, row, rowIndex) => {
          const {
            fee_unit_price: { unit_id },
          } = row
          const sku = _.find(
            store.selectedRows,
            (skuItem) => skuItem.sku_id === record.id,
          )

          let canCopy = false
          if (sku) {
            canCopy =
              unit_id === sku.base_unit_id ||
              unit_id === sku.second_base_unit_id
          }

          return (
            <Space>
              <a onClick={() => handleDeleteRow(record, rowIndex, index)}>
                {t('删除')}
              </a>
              {record.items.length > 1 && canCopy && (
                <a onClick={() => handleSyncRow(record.items, row, record.id)}>
                  {t('复制')}
                </a>
              )}
            </Space>
          )
        },
      },
    ]

    return (
      <div id={record.id}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={record.items}
          pagination={false}
          showHeader={false}
        />
        {record.items.length < 20 && (
          <Button
            type='link'
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddRow(record, index)}
          >
            {t('增加一行')}
          </Button>
        )}
      </div>
    )
  }

  const columns: ColumnType<DataType>[] = [
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
      onCell: () => ({ colSpan: 3 }),
      render: (_, record) => {
        return (
          <div style={{ fontSize: '15px', fontWeight: 600 }}>
            {record.name} ID:{record.customize_code || '-'}
          </div>
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
      width: 200,
    },
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('商品单价')}
        </>
      ),
      key: 'fee_unit_price',
      width: 260,
      dataIndex: 'fee_unit_price',
      onCell: () => ({ colSpan: 0 }),
    },
    {
      title: t('定价公式'),
      key: 'formula_texts',
      width: 200,
      dataIndex: 'formula_texts',
      onCell: () => ({ colSpan: 0 }),
    },
    {
      title: '最小起订数',
      width: 250,
    },
    {
      title: '操作',
      align: 'left',

      dataIndex: 'operation',
      key: 'operation',
    },
  ]

  return (
    <>
      <Form
        form={form}
        onFinish={onSubmit}
        className='merchandise-ant-form-table'
      >
        {/* TODO: 母表格给样式 */}
        <Table
          rowKey='id'
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowRender,
            defaultExpandAllRows: true,
          }}
          scroll={{ y: 'calc(100vh - 300px)' }}
          size='middle'
          dataSource={dataSource}
        />
        <div className='gm-modal-footer'>
          <Button onClick={onCancel}>{t('取消')}</Button>
          <Button onClick={onPrev}>{t('上一步')}</Button>
          <Button onClick={onSubmit} type='primary' loading={loading}>
            {t('提交')}
          </Button>
        </div>
      </Form>
      <SyncPriceItem
        modalRef={syncPriceRef}
        priceList={syncPriceList}
        syncPrice={syncPrice}
        sku={syncSku}
      />
      <FormulartModal
        hidePricingType
        modalRef={formularModalRef}
        handlePresetOK={handlePresetOK}
      />
    </>
  )
}

export default observer(InfoTable)
