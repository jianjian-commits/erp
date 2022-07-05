import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  BomOperationLog,
  map_BomOperationLog_Operation,
} from 'gm_api/src/production'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import store from '../../store'

/**
 * 操作记录列表的属性
 */
interface RecordTableProps {
  /** BOM的ID */
  bomId: string
}

/**
 * 操作记录列表的组件函数
 */
const RecordTable: FC<RecordTableProps> = ({ bomId }) => {
  /** 定义列表的栏 */
  const Columns: Column<BomOperationLog>[] = [
    {
      Header: t('时间'),
      accessor: 'create_time',
      Cell: ({ original }) => {
        console.log(original)
        return moment(original.create_time, 'x').format('YYYY-MM-DD HH:mm')
      },
    },
    {
      Header: t('操作人'),
      accessor: 'operator_name',
    },
    {
      Header: t('操作'),
      accessor: 'operation',
      Cell: ({ original }) => {
        return map_BomOperationLog_Operation[original.operation || 0]
      },
    },
    {
      Header: t('内容'),
      accessor: 'content',
    },
  ]

  const [records, setRecords] = useState<BomOperationLog[]>([])

  useEffect(() => {
    store.getOperationRecords(bomId).then((response) => {
      try {
        setRecords(Object.values(response))
      } catch {
        setRecords([])
      }
    })
  }, [])

  return <Table columns={Columns} data={records} />
}

export default RecordTable
