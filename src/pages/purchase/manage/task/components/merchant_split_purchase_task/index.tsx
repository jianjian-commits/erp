/* eslint-disable promise/no-nesting */
import React, { FC, useState, useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import {
  Modal,
  Select,
  TableColumnProps,
  Table,
  InputNumber,
  Form,
  message,
} from 'antd'
import { observer } from 'mobx-react'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Flex } from '@gm-pc/react'
import { TableData, SplitTable } from '../../interface'
import Big from 'big.js'
import store, { initTable } from '../../store'
import baseStore from '../../../../store'
import _ from 'lodash'

/** @description 限制小数位 */
const limitDecimals = (value: string | number): string => {
  // eslint-disable-next-line no-useless-escape
  const reg = /^(\-)*(\d+)\.(\d\d\d\d).*$/

  if (typeof value === 'string') {
    return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
  } else if (typeof value === 'number') {
    return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
  } else {
    return ''
  }
}

interface MerchantSplitPurchaseTaskProps {
  chooseSplitMerchants: TableData
  visible: boolean
  index: number
  handleCancel: () => void
}
const MerchantSplitPurchaseTask: FC<MerchantSplitPurchaseTaskProps> = ({
  chooseSplitMerchants,
  visible,
  handleCancel,
  index,
}) => {
  const [form] = Form.useForm()
  const [allNeed, setAllNeed] = useState(0)
  const [loading, setLoading] = useState(false)
  const { suppliers, fetchSuppliers } = baseStore
  const {
    updateSplitTable,
    splitTable,
    splitMerchants,
    doRequest,
    setDrawerVisible,
    initSplitTable,
  } = store
  const tableNode = useRef<HTMLDivElement>(null)
  // 是否需要滚动到底部（新增商品时需要）
  const shouldScrollBottom = useRef(false)

  const handleOk = () => {
    if (splitTable.length < 2) {
      message.destroy()
      message.error(t('最少拆分为两条采购计划'))
      return
    }

    /** @description 判断是否大于两个供应商 */
    const arr = _.uniq(_.map(splitTable, (item) => item.supplier_id))
    if (arr.length < 2 || arr.length < splitTable.length) {
      message.destroy()
      message.error(t('关联客户拆分不能拆分成同一个供应商!'))
      return
    }

    form
      .validateFields()
      .then(() => {
        Modal.confirm({
          title: t('确定拆分商户需求？'),
          content: t('拆分后，若修改关联订单中的下单数，将无法同步至采购计划!'),
          onOk: () => {
            setLoading(true)
            splitMerchants(chooseSplitMerchants, index)
              .then(() => {
                doRequest()
                message.success(t('拆分成功!'))
                handleCancel()
                setDrawerVisible(false)
              })
              .finally(() => {
                setLoading(false)
              })
          },
        })
      })
      .catch(() => {
        message.error(t('请填写正确的供应商和需求数！'))
      })
  }

  useEffect(() => {
    if (shouldScrollBottom.current) {
      shouldScrollBottom.current = false
      const div =
        tableNode.current && tableNode.current.querySelector('.ant-table-body')
      if (div) {
        div.scrollTo({ top: div.scrollHeight! })
      }
    }
  })

  useEffect(() => {
    fetchSuppliers()
    return () => {
      initSplitTable()
    }
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      splitTable: _.map(splitTable, (item) => ({
        ...item,
        supplier_id: item.supplier_id === '0' ? undefined : item.supplier_id,
      })),
    })
  }, [splitTable])

  /** @description 算出来合计的值 */
  const handleChange = (_: any, all: Record<'splitTable', SplitTable[]>) => {
    updateSplitTable(all.splitTable)
    calculateNeedValue(all.splitTable)
  }

  /** @description 计算需求数 */
  const calculateNeedValue = (splitTable: SplitTable[]) => {
    let num = 0
    _.forEach(splitTable, (item) => {
      num = +Big(item.need_value || 0).add(num)
    })
    setAllNeed(num)
  }

  /** @description 增加一行 */
  const handleAdd = () => {
    shouldScrollBottom.current = true
    if (splitTable.length >= 10) {
      message.destroy()
      message.error(t('最多拆分10条采购计划！'))
      return
    }
    splitTable.push({ ...initTable })
    updateSplitTable(splitTable)
  }

  /** @description 删除一行 */
  const handleDelete = (index: number) => {
    splitTable.splice(index, 1)
    updateSplitTable(splitTable)
    calculateNeedValue(splitTable)
  }

  const columns: TableColumnProps<SplitTable>[] = [
    {
      title: '',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      key: 'index',
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: t('供应商'),
      dataIndex: 'supplier_id',
      width: 380,
      key: 'supplier_id',
      render: (_, __, index) => (
        <Form.Item
          name={['splitTable', index, 'supplier_id']}
          rules={[{ required: true }]}
        >
          <Select
            options={suppliers.slice() || []}
            style={{ width: '240px' }}
            placeholder={t('请选择供应商')}
          />
        </Form.Item>
      ),
    },
    // {
    //   title: t('供货上限'),
    //   dataIndex: 'age',
    //   align: 'center',
    //   key: 'age',
    // },
    // {
    //   title: t('参考价'),
    //   dataIndex: 'address',
    //   key: 'address',
    // },
    {
      title: t('需求数'),
      key: 'need',
      dataIndex: 'need',
      render: (_, __, index: number) => (
        <Form.Item
          name={['splitTable', index, 'need_value']}
          rules={[
            { required: true, message: t('不能为0') },
            () => ({
              validator(_, value) {
                if (+value > 0) {
                  return Promise.resolve()
                } else {
                  return Promise.reject(new Error('不能为0！'))
                }
              },
            }),
          ]}
        >
          <InputNumber
            style={{ width: '240px' }}
            placeholder={t('填写需求数')}
            min={0}
            // @ts-ignore
            formatter={limitDecimals}
            // @ts-ignore
            parser={limitDecimals}
            // onChange={(value) => handleChange('' + value, 'plan_value', index)}
          />
        </Form.Item>
      ),
    },
    {
      title: t('操作'),
      key: 'op',
      width: 120,
      dataIndex: 'op',
      render: (_, __, index) => (
        <a onClick={() => handleDelete(index)}>{t('删除')}</a>
      ),
    },
  ]

  return (
    <Modal
      visible={visible}
      onCancel={handleCancel}
      className='split'
      onOk={handleOk}
      mask={false}
      bodyStyle={{ padding: 0 }}
      destroyOnClose
      confirmLoading={loading}
      title={t('拆分商户需求')}
      width={1200}
    >
      <div className='split-header'>
        <strong className='tw-mb-2 tw-block tw-text-lg'>
          {t(chooseSplitMerchants?.customer_name || '-')}
        </strong>
        <Flex>
          <span className='tw-mr-11'>
            {t(
              `订单号：${
                chooseSplitMerchants?.request_sheet_serial_no! || '-'
              }`,
            )}
          </span>
          <span className='tw-mr-11'>
            {t(`商品名称：${chooseSplitMerchants?.sku?.name! || '-'}`)}
          </span>
          <span className='tw-mr-11'>
            {t(
              `需求数：${Big(
                +chooseSplitMerchants.val?.input?.quantity! || '0',
              ).div(chooseSplitMerchants?.rate || 1)}${chooseSplitMerchants?.sku
                ?.unit_name!} `,
            )}
          </span>
        </Flex>
      </div>
      <div className='split-body'>
        <Form form={form} onValuesChange={handleChange}>
          <Table
            pagination={false}
            columns={columns}
            dataSource={splitTable.slice() || []}
            scroll={{ y: 300 }}
            ref={tableNode}
            footer={() => (
              <Flex alignCenter justifyBetween className='tw-w-full tw-h-8'>
                <div onClick={handleAdd} style={{ color: '#176CFE' }}>
                  <PlusCircleOutlined className='tw-cursor-pointer' />
                  <span className='tw-ml-1 tw-cursor-pointer'>
                    {t('增加一行')}
                  </span>
                </div>
                <>
                  {t(`合计:${allNeed + chooseSplitMerchants?.sku?.unit_name!}`)}
                </>
              </Flex>
            )}
          />
        </Form>
      </div>
    </Modal>
  )
}
export default observer(MerchantSplitPurchaseTask)
