import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import { TableList, TableListColumn } from '@gm-pc/business'
import { Space } from 'antd'
import { Log } from 'gm_api/src/logsystem'
import store from '../store'

const List: FC = observer(() => {
  const { list, filter, getLogList } = store

  const columns: TableListColumn<Log>[] = [
    {
      Header: t('操作人'),
      id: 'user_name',
      minWidth: 200,
      Cell: (cellProps) => {
        return cellProps.original.user_name || '-'
      },
    },
    {
      Header: t('操作时间'),
      id: 'operation_time',
      minWidth: 200,

      Cell: (cellProps) => {
        if (cellProps.original.operation_time) {
          return moment(Number(cellProps.original.operation_time)).format(
            'YYYY-MM-DD HH:mm:ss',
          )
        } else {
          return '-'
        }
      },
    },
    {
      Header: t('操作类型'),
      id: 'operation_type',
      minWidth: 200,
      accessor: 'operation_type',
    },
    {
      Header: t('日志内容'),
      id: 'content',
      minWidth: 400,
      Cell: (cellProps) => {
        const {
          original: { content },
        } = cellProps
        try {
          const contentObj = JSON.parse(content!)
          if (contentObj.desc) {
            console.log(contentObj.desc)
          }
          return (
            <Space size={0}>
              {contentObj.desc}：
              <a href={contentObj.file_url}>{contentObj.file_name}</a>
            </Space>
          )
        } catch {
          return <div style={{ whiteSpace: 'pre-line' }}>{content}</div>
        }
      },
    },
  ]

  return (
    <div
      className='gm-site-card-border-less-wrapper-106'
      style={{ padding: '0 16px' }}
    >
      <TableList<Log>
        id='log_list'
        keyField='log_id'
        data={list}
        filter={filter}
        service={getLogList}
        columns={columns}
        isUpdateEffect={false}
        headerProps={{ hidden: true }}
        paginationOptions={{
          paginationKey: 'log_list',
          defaultPaging: { need_count: true },
        }}
      />
    </div>
  )
})

export default List
