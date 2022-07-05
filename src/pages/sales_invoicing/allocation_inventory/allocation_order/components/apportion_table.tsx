import React, { FC } from 'react'
import { BoxPanel, Price, Dialog, ListDataItem } from '@gm-pc/react'
import { i18next, t } from 'gm-i18n'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from './../stores/receipt_store'
import {
  getEnumText,
  getFormatTimeForTable,
  getUnNillText,
} from '@/common/util'
import SVGEdit from '@/svg/edit_pen.svg'
import { canEdit } from '@/pages/sales_invoicing/util'

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

interface Props {
  data: any[]
  methodData: ListDataItem<any>[]
  type: 'add' | 'detail'
  onAdd: () => void
  onDel: (index: number) => void
}

const ApportionTable: FC<Props> = observer((props) => {
  const { data, type, onAdd, onDel, methodData } = props
  const { getRelationInfo, receiptDetail } = store
  const isAdd = canEdit(receiptDetail.status)

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
            Cell: (cellProps: any) => {
              const { index } = cellProps
              return (
                <EditOperation
                  onAddRow={data.length === 0 ? onAdd : undefined}
                  onDeleteRow={
                    data.length === 1 ? () => handleShareDel(index) : undefined
                  }
                />
              )
            },
          },
          {
            Header: t('操作时间'),
            accessor: 'create_time',
            minWidth: 100,
            Cell: (cellProps: any) => {
              const { original } = cellProps
              return getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                original.create_time,
              )
            },
          },
          // {
          //   Header: t('责任仓'),
          //   accessor: 'duty_warehouse_id',
          //   minWidth: 100,
          //   Cell: (cellProps: any) => {
          //     const { duty_warehouse_id } = cellProps.original
          //     const warehouse = getRelationInfo('warehouses', duty_warehouse_id)
          //     return getUnNillText(warehouse?.name)
          //   },
          // },
          {
            Header: t('调拨金额'),
            accessor: 'money',
            minWidth: 100,
            Cell: (cellProps: any) => {
              const { money } = cellProps.original
              return money ? money + Price.getUnit() : '-'
            },
          },
          {
            Header: t('分摊方式'),
            accessor: 'type',
            minWidth: 100,
            Cell: (cellProps: any) => {
              const { type } = cellProps.original
              return getEnumText(methodData, type) || '-'
            },
          },
          {
            Header: t('备注'),
            minWidth: 100,
            accessor: 'remark',
            Cell: (cellProps: any) => {
              const { remark } = cellProps.original
              return remark ?? '-'
            },
          },
          {
            Header: t('操作人'),
            minWidth: 100,
            accessor: 'creator_id',
            Cell: (cellProps: any) => {
              const { creator_id } = cellProps.original
              const user = getRelationInfo('group_users', creator_id)
              return user.name || '-'
            },
          },
          {
            Header: t('操作'),
            minWidth: 100,
            show: isAdd,
            Cell: () => {
              return (
                <span onClick={onAdd}>
                  <SVGEdit />
                </span>
              )
            },
          },
        ]}
      />
    </BoxPanel>
  )
})

export default ApportionTable
