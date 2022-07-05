import { t } from 'gm-i18n'
import React, { FC } from 'react'

import { Price, BoxPanel, ListDataItem } from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import {
  getEnumText,
  getFormatTimeForTable,
  toFixedByType,
} from '@/common/util'
import { PrecisionMapKeyType } from '@/common/interface'
const { TABLE_X, OperationHeader, EditOperation } = TableXUtil

interface Props {
  data: any[]
  reasonData: ListDataItem<any>[]
  actionData: ListDataItem<any>[]
  type: 'add' | 'detail'
  moneyPrecisionType?: PrecisionMapKeyType
  onAdd: () => void
  onDel: (index: number) => void
}

const DiscountTable: FC<Props> = (props) => {
  const {
    data,
    type,
    onAdd,
    onDel,
    reasonData,
    actionData,
    moneyPrecisionType,
  } = props

  const handleDiscountDel = (index: number) => {
    onDel(index)
  }

  const handleDiscountAdd = () => {
    onAdd()
  }

  return (
    <BoxPanel
      title={t('金额折让')}
      summary={[{ text: t('合计'), value: data.length }]}
      collapse
    >
      <Table
        isEdit
        data={data.length === 0 ? [{}] : data}
        columns={[
          {
            Header: OperationHeader,
            accessor: 'action',
            fixed: 'left',
            show: type === 'add',
            width: TABLE_X.WIDTH_EDIT_OPERATION + 10,
            Cell: (cellProps) => {
              const { index } = cellProps
              return (
                <EditOperation
                  onAddRow={() => handleDiscountAdd()}
                  onDeleteRow={
                    data.length > 0 ? () => handleDiscountDel(index) : undefined
                  }
                />
              )
            },
          },
          {
            Header: t('操作时间'),
            accessor: 'create_time',
            Cell: (cellProps) => {
              return getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                cellProps.original.create_time,
              )
            },
          },
          {
            Header: t('折让原因'),
            accessor: 'reason',
            Cell: (cellProps) =>
              getEnumText(reasonData, cellProps.original.reason),
          },
          {
            Header: t('折让类型'),
            accessor: 'action',
            Cell: (cellProps) =>
              getEnumText(actionData, cellProps.original.action),
          },
          {
            Header: t('折让金额'),
            accessor: 'money',
            Cell: (cellProps) => {
              const { money } = cellProps.original
              return money
                ? toFixedByType(
                    money,
                    moneyPrecisionType ?? 'dpInventoryAmount',
                  ) + Price.getUnit()
                : '-'
            },
          },
          {
            Header: t('备注'),
            accessor: 'remark',
            Cell: ({ original }) => {
              return original.remark ?? '-'
            },
          },
          {
            Header: t('操作人'),
            accessor: 'operator_name',
            Cell: ({ original }) => {
              return original.operator_name ?? '-'
            },
          },
        ]}
      />
    </BoxPanel>
  )
}

export default DiscountTable
