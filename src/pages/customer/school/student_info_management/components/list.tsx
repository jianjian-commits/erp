import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableInfo, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { Table, Column } from '@gm-pc/table-x'
import store from '../store'
import { map_Gender } from 'gm_api/src/common'
import { MapId_Customer } from 'gm_api/src/enterprise/pc'

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { student_info_list, count } = store
  const columns: Column[] = [
    {
      Header: t('序号'),
      id: 'index',
      fixed: 'left',
      width: 80,
      Cell: (cellProps) => {
        return <div>{cellProps.index + 1}</div>
      },
    },
    {
      Header: t('学生姓名'),
      accessor: 'name',
      minWidth: 80,
    },
    {
      Header: t('学生性别'),
      accessor: 'gender',
      minWidth: 80,
      Cell: (cellProps) => {
        const { gender } = cellProps.original
        return <div>{map_Gender[gender] || '-'}</div>
      },
    },
    {
      Header: t('家长姓名'),
      accessor: 'parent_name',
      minWidth: 80,
      Cell: (cellProps) => {
        const { parent_name } = cellProps.original
        return <div>{parent_name || '-'}</div>
      },
    },
    {
      Header: t('家长联系方式'),
      accessor: 'parent_phone',
      minWidth: 80,
      Cell: (cellProps) => {
        const { parent_phone } = cellProps.original
        return <div>{parent_phone || '-'}</div>
      },
    },
    {
      Header: t('学校'),
      accessor: 'school',
      minWidth: 80,
      Cell: (cellProps) => {
        const { attrs } = cellProps.original
        return <MapId_Customer id={attrs.parent_ids[0]} />
      },
    },
    {
      Header: t('班级'),
      accessor: 'class',
      minWidth: 80,
      Cell: (cellProps) => {
        const { attrs } = cellProps.original
        return <MapId_Customer id={attrs.parent_ids[1]} />
      },
    },
  ]
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('学生总数'),
                content: count,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table data={student_info_list.slice()} columns={columns} />
    </BoxTable>
  )
}
export default observer(List)
