import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Button, Tip, BoxTableProps } from '@gm-pc/react'
import { gmHistory as history } from '@gm-common/router'
import { TableXUtil, Table } from '@gm-pc/table-x'
import store from '../store'
import { t } from 'gm-i18n'

import { Role_Type } from 'gm_api/src/enterprise'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  refresh: () => Promise<any>
}

const List: FC<ListProps> = ({ refresh, pagination }) => {
  const handleDelete = (id: string, type: Role_Type) => {
    if (
      type === Role_Type.BUILT_IN_ADMIN ||
      type === Role_Type.BUILT_IN_DRIVER ||
      type === Role_Type.BUILT_IN_PURCHASER
    ) {
      return Tip.danger(t('内建角色无法删除！'))
    }
    return store.delRole(id).then(() => refresh())
  }
  return (
    <div>
      <BoxTable
        pagination={pagination}
        action={
          <Button
            type='primary'
            onClick={() => history.push('/role_manage/detail')}
            className='gm-margin-left-10'
          >
            {t('新建角色')}
          </Button>
        }
      >
        <Table<any>
          data={store.list}
          columns={[
            { Header: t('角色'), accessor: 'name' },
            {
              Header: TableXUtil.OperationHeader,
              width: 80,
              id: 'op',
              Cell: (cellProps) => {
                const { role_id, type } = cellProps.original
                return (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationDetail
                      href={`#/role_manage/detail?role_id=${role_id}`}
                    />
                    <TableXUtil.OperationDelete
                      disabled={type === 2 || type === 3 || type === 4}
                      title={t('确认删除')}
                      onClick={handleDelete.bind(null, role_id, type)}
                    >
                      {t('是否要删除该客户？')}
                    </TableXUtil.OperationDelete>
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </BoxTable>
    </div>
  )
}

export default observer(List)
