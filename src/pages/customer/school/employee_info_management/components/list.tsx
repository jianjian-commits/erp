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
  const { employee_info_list, count } = store
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
      Header: t('职工姓名'),
      accessor: 'name',
      minWidth: 80,
      Cell: (cellProps) => {
        const { name } = cellProps.original
        return <div>{name || '-'}</div>
      },
    },
    {
      Header: t('职工性别'),
      accessor: 'gender',
      minWidth: 80,
      Cell: (cellProps) => {
        const { gender } = cellProps.original
        return <div>{map_Gender[gender] || '-'}</div>
      },
    },
    {
      Header: t('联系方式'),
      accessor: 'phone',
      minWidth: 80,
      Cell: (cellProps) => {
        const { phone } = cellProps.original
        return <div>{phone || '-'}</div>
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
                label: t('职工总数'),
                content: count,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table data={employee_info_list.slice()} columns={columns} />
    </BoxTable>
  )
}
export default observer(List)
