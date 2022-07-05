import React, { FC, useEffect, useMemo, useState } from 'react'
import {
  TableColumnProps,
  Table,
  Select,
  Checkbox,
  Button,
  Modal,
  message,
} from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import splitStore from './store'
import store from '../../store'
import baseStore from '../../../../store'
import { observer } from 'mobx-react'
import { TableList } from './interface'
import _ from 'lodash'
import { REQUEST_SOURCE } from '../../../../enum'
import globalStore from '@/stores/global'
import Big from 'big.js'

interface SplitTableProps {
  className?: string | undefined
  isBatch: boolean
  handleCloseBatch: () => void
}

const SplitTable: FC<SplitTableProps> = ({
  className,
  isBatch,
  handleCloseBatch,
}) => {
  const { tableList, setTableList, chooseSplitTask } = splitStore
  const { suppliers } = baseStore
  const { customers, setSelected } = store

  /** @description 控制batchModal */
  const [batchSelect, setBatchSelect] = useState(false)
  /** @description 用来控制上层全选 */
  const [indeterminate, setIndeterminate] = useState(false)
  /** @description 选中的值 */
  const [value, setValue] = useState<string[]>([])
  /** @description 全选的值 */
  const [checked, setChecked] = useState(false)
  /** @description 批量供应商的value */
  const [supplierValue, setSupplierValue] = useState('0')

  /** @description 用来控制columns的变化 */
  const columns: TableColumnProps<TableList>[] = useMemo(() => {
    return [
      {
        title: '',
        dataIndex: 'index',
        align: 'center',
        width: 50,
        key: 'index',
        render: (__, ____, index: number) => <span>{index + 1}</span>,
      },
      isBatch ? Table.SELECTION_COLUMN : { className: 'tw-hidden' },
      {
        title: t('单据类型'),
        dataIndex: 'billType',
        key: 'billType',
        width: 200,
        align: 'center',
        render: (__, record) => <>{REQUEST_SOURCE[record.request_source]}</>,
      },
      {
        title: t('单据编号'),
        dataIndex: 'age',
        key: 'age',
        align: 'center',
        render: (__, record) => <>{record.request_sheet_serial_no || '-'}</>,
      },
      {
        title: t('客户'),
        dataIndex: 'address',
        key: 'address',
        width: 200,
        align: 'center',
        render: (__, record) => {
          const { customer_id } = record
          return (
            <>{customer_id === '0' ? '-' : customers?.[customer_id!]?.name}</>
          )
        },
      },
      {
        title: t('需求数'),
        key: 'need',
        width: 120,
        align: 'center',
        dataIndex: 'need',
        render: (__, record) => {
          const quantity = Big(record.val?.calculate?.quantity! || 0)
            .div(chooseSplitTask.rate || 1)
            .toFixed(4)
          const unit_name = chooseSplitTask?.unit_name! || '-'
          return (
            <>
              {quantity}
              {unit_name}
            </>
          )
        },
      },
      // {
      //   title: t('计划采购'),
      //   key: 'plan',
      //   width: 120,
      //   align: 'center',
      //   dataIndex: 'plan',
      //   render: (__, record) => {
      //     const quantity = Big(record.val?.calculate?.quantity! || 0)
      //       .div(chooseSplitTask.rate || 1)
      //       .toFixed(4)
      //     const unit_name = chooseSplitTask?.unit_name! || '-'
      //     return (
      //       <>
      //         {quantity}
      //         {unit_name}
      //       </>
      //     )
      //   },
      // },
      {
        title: t('供应商'),
        key: 'supplier_id',
        render: (__, record, index: number) => (
          <Select
            style={{ width: '200px' }}
            options={suppliers.slice() || []}
            placeholder={t('请选择供应商')}
            value={record.supplier_id === '0' ? undefined : record.supplier_id}
            onChange={(value) => {
              handleChange(value, 'supplier_id', index)
            }}
          />
        ),
      },
    ]
  }, [isBatch])

  /** @description 用来选择上面的东西 */
  const handleChangeAll = (e: CheckboxChangeEvent) => {
    setIndeterminate(false)
    if (e.target.checked) {
      setValue(tableList.map((item: any) => item.table_id))
    } else {
      setValue([])
    }
    setChecked(e.target.checked)
  }

  /** @description 打开批量设置的弹框 */
  const handleBatch = () => {
    if (value.length === 0)
      return message.error(t('请选择需要设置供应商的条目!'))
    setBatchSelect(true)
  }

  /** @description 修改table的supplier_id */
  const handleChange = (value: string, key: string, index: number) => {
    setTableList(value, key, index)
  }

  /** @description 批量设置供应商的接口 */
  const handleOk = () => {
    _.forEach(value, (item) => {
      const findIndex = _.findIndex(tableList, (i) => i.table_id === +item)
      handleChange(supplierValue, 'supplier_id', findIndex)
    })
    handleClose()
    handleCancel()
  }

  /** @description 关闭批量设置供应商 */
  const handleCancel = () => {
    setBatchSelect(false)
    setSupplierValue('0')
  }

  const rowSelection = {
    onChange: (value: any, allValue: any) => {
      console.log(value, allValue)
      if (value.length < tableList.length!) {
        if (value.length === 0) {
          setIndeterminate(false)
          setChecked(false)
        } else {
          setIndeterminate(true)
        }
      } else {
        setIndeterminate(false)
        setChecked(true)
      }
      setValue(value)
    },
    selectedRowKeys: value,
    onSelectAll: (selectAll: boolean, value: any) => {
      setChecked(selectAll)
      setValue(value.map((item: any) => item.testId))
    },
  }

  /** @description 关闭供应商批量的按钮 */
  const handleClose = () => {
    setValue([])
    setChecked(false)
    setIndeterminate(false)
    handleCloseBatch()
  }
  return (
    <div className={className + ' tw-pb-4'}>
      {isBatch && (
        <Flex className='split-table-header' alignCenter>
          <CloseOutlined
            onClick={handleClose}
            style={{ marginRight: '30px' }}
          />
          <Checkbox
            onChange={handleChangeAll}
            indeterminate={indeterminate}
            checked={checked}
            style={{ marginLeft: '1px' }}
          />
          <span className='split-table-header-border'>
            {t(`已选择${value.length}项内容`)}
          </span>
          <span className='tw-mr-4'> {t('批量操作')}</span>
          <Button
            size='middle'
            onClick={handleBatch}
            className='split-table-header-batchButton'
          >
            {t('设置供应商')}
          </Button>
        </Flex>
      )}
      <Table
        rowKey='table_id'
        pagination={false}
        rowSelection={isBatch ? rowSelection : undefined}
        columns={columns}
        dataSource={tableList.slice() || []}
      />
      {batchSelect && (
        <Modal
          visible={batchSelect}
          destroyOnClose
          title={t('批量设置供应商')}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Flex alignCenter>
            <span>{t('供应商：')}</span>
            <Select
              style={{ width: '300px' }}
              options={suppliers.slice() || []}
              placeholder={t('请选择供应商')}
              value={supplierValue === '0' ? undefined : supplierValue}
              onChange={(value) => {
                setSupplierValue(value)
              }}
            />
          </Flex>
        </Modal>
      )}
    </div>
  )
}
export default observer(SplitTable)
