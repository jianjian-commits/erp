import React, { FC, useState, useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import {
  TableColumnProps,
  Table,
  Select,
  Form,
  InputNumber,
  message,
  FormInstance,
} from 'antd'
import _ from 'lodash'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Flex } from '@gm-pc/react'
import splitStore, { initNumberTable } from './store'
import baseStore from '../../../../store'
import { observer } from 'mobx-react'
import { NumberTableList, ValueNumberTable } from './interface'
import Big from 'big.js'

interface SplitNumberTableProps {
  className?: string | undefined
  form: FormInstance<ValueNumberTable>
}

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

const SplitNumberTable: FC<SplitNumberTableProps> = ({ className, form }) => {
  const tableNode = useRef<HTMLDivElement>(null)
  const [allNeed, setAllNeed] = useState(0)
  const { numberTable, updateNumberTable, chooseSplitTask } = splitStore
  const { suppliers } = baseStore

  // 是否需要滚动到底部（新增商品时需要）
  const shouldScrollBottom = useRef(false)

  /** @description 自动触底 */
  useEffect(() => {
    if (shouldScrollBottom.current) {
      shouldScrollBottom.current = false
      const div =
        tableNode.current && tableNode.current.querySelector('.ant-table-body')
      if (div) {
        div.scrollTo({ top: div.scrollHeight })
      }
    }
  })

  useEffect(() => {
    form.setFieldsValue({
      numberTable: _.map(numberTable, (item) => ({
        ...item,
        supplier_id: item.supplier_id === '0' ? undefined : item.supplier_id,
      })),
    })
  }, [numberTable])

  /** @@description 删除表单的某一行 */
  const handleDelete = (index: number) => {
    numberTable.splice(index, 1)
    updateNumberTable(numberTable)
    calculateNeedValue(numberTable)
  }

  /** @@description 增加表单的某一行 */
  const handleAdd = async () => {
    shouldScrollBottom.current = true
    if (numberTable.length >= 10) {
      message.destroy()
      message.error(t('最多拆分10条采购计划！'))
      return
    }
    numberTable.push({ ...initNumberTable })
    updateNumberTable(numberTable)
  }

  /** @@description 算出合计需求数 */
  const calculateNeedValue = (numberTable: NumberTableList[]) => {
    let num = 0
    _.forEach(numberTable, (item) => {
      num = +Big(item.need_value || 0).add(num)
    })
    setAllNeed(num)
  }

  /** @description 算出来合计的值 */
  const handleChange = (__: NumberTableList, all: ValueNumberTable) => {
    updateNumberTable(all.numberTable)
    calculateNeedValue(all.numberTable)
  }

  const columns: TableColumnProps<NumberTableList>[] = [
    {
      title: '',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      key: 'index',
      render: (_, __, index: number) => <span>{index + 1}</span>,
    },
    {
      title: t('供应商'),
      dataIndex: 'billType',
      key: 'billType',
      render: (_, __, index) => (
        <Form.Item
          name={['numberTable', index, 'supplier_id']}
          rules={[{ required: true }]}
        >
          <Select
            style={{ width: '240px' }}
            options={suppliers.slice() || []}
            placeholder={t('请选择供应商')}
            // onChange={(value) => handleChange(value, 'supplier_id', index)}
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
      dataIndex: 'need_value',
      render: (_, __, index) => (
        <Form.Item
          name={['numberTable', index, 'need_value']}
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
      width: 120,
      key: 'op',
      align: 'center',
      dataIndex: 'op',
      render: (_, __, index: number) => (
        <a onClick={() => handleDelete(index)}>{t('删除')}</a>
      ),
    },
  ]

  return (
    <div className={className}>
      <Form form={form} onValuesChange={handleChange}>
        <Table
          pagination={false}
          columns={columns}
          dataSource={numberTable.slice()}
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
              <>{t(`合计:${allNeed + chooseSplitTask?.unit_name!}`)}</>
            </Flex>
          )}
        />
      </Form>
    </div>
  )
}
export default observer(SplitNumberTable)
