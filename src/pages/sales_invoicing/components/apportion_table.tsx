import React, { FC } from 'react'
import { BoxPanel, Price, Dialog, ListDataItem } from '@gm-pc/react'
import { i18next, t } from 'gm-i18n'
import { Table, TableXUtil } from '@gm-pc/table-x'

import { getEnumText, getFormatTimeForTable } from '@/common/util'

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

interface Props {
  data: any[]
  actionData: ListDataItem<any>[]
  methodData: ListDataItem<any>[]
  reasonData: ListDataItem<any>[]
  type: 'add' | 'detail'
  onAdd: () => void
  onDel: (index: number) => void
}

const ApportionTable: FC<Props> = (props) => {
  const { data, type, onAdd, onDel, actionData, methodData, reasonData } = props

  const handleShareDel = (index: number) => {
    Dialog.render({
      children: t('是否删除此记录?'),
      title: t('确认删除'),
      buttons: [
        { text: t('取消'), onClick: Dialog.hide },
        {
          text: t('确认'),
          onClick: () => {
            onDel(index)
            Dialog.hide()
          },
          btnType: 'primary',
        },
      ],
    })
  }

  return (
    <BoxPanel
      title={t('费用分摊')}
      collapse
      summary={[{ text: i18next.t('合计'), value: data.length }]}
    >
      <Table
        isEdit
        data={data.length === 0 ? [{}] : data}
        columns={[
          {
            Header: OperationHeader,
            accessor: 'action',
            show: type === 'add',
            fixed: 'left',
            width: TABLE_X.WIDTH_EDIT_OPERATION + 10,
            Cell: (cellProps) => {
              return (
                <EditOperation
                  onAddRow={data.length === 0 ? onAdd : undefined}
                  onDeleteRow={
                    data.length === 1
                      ? () => handleShareDel(cellProps.index)
                      : undefined
                  }
                />
              )
            },
          },
          {
            Header: t('操作时间'),
            accessor: 'create_time',
            minWidth: 100,
            Cell: (cellProps) => {
              return getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                cellProps.original.create_time,
              )
            },
          },
          {
            Header: t('分摊原因'),
            accessor: 'reason',
            minWidth: 100,
            Cell: ({ original }) => {
              return getEnumText(reasonData, original.reason) || '-'
            },
          },
          {
            Header: t('分摊类型'),
            accessor: 'action',
            minWidth: 100,
            Cell: ({ original }) => {
              return getEnumText(actionData, original.action) || '-'
            },
          },
          {
            Header: t('分摊金额'),
            accessor: 'money',
            minWidth: 100,
            Cell: ({ original }) => {
              return original.money ? original.money + Price.getUnit() : '-'
            },
          },
          {
            Header: t('分摊方式'),
            accessor: 'method',
            minWidth: 100,
            Cell: ({ original }) => {
              return getEnumText(methodData, original.method) || '-'
            },
          },
          {
            Header: t('备注'),
            minWidth: 100,
            accessor: 'remark',
            Cell: ({ original }) => {
              return original.remark ?? '-'
            },
          },
          {
            Header: t('操作人'),
            minWidth: 100,
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

export default ApportionTable
