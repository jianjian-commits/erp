import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Button,
  Dialog,
  Tip,
} from '@gm-pc/react'
import { ProcessType } from 'gm_api/src/production'

import TableTotalText from '@/common/components/table_total_text'
import NewProcessType from './new'
import store from '../store'

const { OperationCell, OperationDelete, OperationHeader } = TableXUtil

const List: FC<Pick<BoxTableProps, 'pagination'>> = observer(
  ({ pagination }) => {
    const handleCreateNewProcessType = () => {
      Dialog.render({
        title: t('新建工序类型'),
        buttons: [],
        children: <NewProcessType />,
      })
    }

    const handleDeleteProcessType = (process_type_id: string) => {
      store.deleteProcessType(process_type_id).then((json) => {
        if (json.response.process_type) {
          Tip.success(t('删除成功'))
          store.doRequest()
        }
        return json
      })
    }

    const { processTypeList } = store

    return (
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('工序类型数'),
                  content: store.processTypeCount,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <Button type='primary' onClick={handleCreateNewProcessType}>
            {t('新建工序类型')}
          </Button>
        }
      >
        <Table<ProcessType>
          columns={[
            {
              Header: t('类型名称'),
              id: 'name',
              Cell: (cellProps) => {
                const {
                  original: { name },
                } = cellProps
                return <div>{name || '-'}</div>
              },
            },
            {
              Header: OperationHeader,
              id: 'operation',
              Cell: (cellProps) => {
                const {
                  original: { process_type_id },
                } = cellProps

                return (
                  <OperationCell>
                    <OperationDelete
                      title={t('删除工序')}
                      onClick={() => handleDeleteProcessType(process_type_id)}
                    >
                      {t(
                        '删除后，绑定该类型的工序，其工序类型将重置为未分类。确认删除？',
                      )}
                    </OperationDelete>
                  </OperationCell>
                )
              },
            },
          ]}
          data={processTypeList}
        />
      </BoxTable>
    )
  },
)

export default List
