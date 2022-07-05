import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Column, Table } from '@gm-pc/table-x'

import detailStore from '../../stores/detail_store'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import CopySvg from '@/svg/copy.svg'
import { getFormatTimeForTable } from '@/common/util'
import { Stock_Sheet_Type } from './filter'

type EditDetailProps = {
  onHide: () => void
}

const EditDetail: FC<EditDetailProps> = observer(({ onHide }) => {
  const { modalRightData, fetchAndAdapterStockSheet } = detailStore

  const copyStockInOrder = async (stock_sheet_id: string) => {
    const { isAllStockOut } = await fetchAndAdapterStockSheet(
      stock_sheet_id,
      true,
    )
    if (isAllStockOut !== undefined && !isAllStockOut) return
    onHide()
  }

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        Cell: (cellProps) => {
          const { create_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time)
        },
      },
      {
        Header: t('入库时间'),
        accessor: 'submit_time',
        Cell: (cellProps) => {
          const { submit_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time)
        },
      },
      {
        Header: t('入库单号'),
        accessor: 'stock_sheet_serial_no',
        Cell: (cellProps) => {
          const {
            stock_sheet_id,
            stock_sheet_serial_no,
            sheet_status,
            status,
            sheet_type,
          } = cellProps.original
          const sheet_type_url =
            Stock_Sheet_Type.find((item) => item.value === sheet_type)?.url ||
            ''
          const targetUrl = `/sales_invoicing/${sheet_type_url}`
          return (
            <StockSheetLink
              target
              url={targetUrl}
              sheetStatus={sheet_status}
              showText={stock_sheet_serial_no}
              stockSheetId={stock_sheet_id}
              status={status!}
            />
          )
        },
      },
      {
        Header: t('入库类型'),
        accessor: 'sheet_type',
        Cell: (cellProps) => {
          const { value } = cellProps
          return (
            Stock_Sheet_Type.find((item) => item.value === value)?.text ?? '-'
          )
        },
      },
      {
        Header: t('供应商'),
        accessor: 'target_name',
        Cell: (cellProps) => {
          const { value } = cellProps
          return value
        },
      },
      {
        Header: t('操作'),
        accessor: 'stock_sheet_id',
        Cell: (cellProps) => {
          const { value: stock_sheet_id } = cellProps
          return <CopySvg onClick={() => copyStockInOrder(stock_sheet_id)} />
        },
      },
    ]
  }, []) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <Table
      id='stock_type_table'
      data={modalRightData.slice()}
      columns={columns}
    />
  )
})

export default EditDetail
