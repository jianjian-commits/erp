import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { Card, Space } from 'antd'
import store from '../store'
import _ from 'lodash'
import { Log } from 'gm_api/src/logsystem'
import moment from 'moment'

const List: FC = observer(() => {
  const { type, modelId, list, filter, getLogList } = store

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
        return moment(Number(cellProps.original.operation_time)).format(
          'YYYY-MM-DD HH:mm:ss',
        )
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
    <Card
      className='gm-site-card-border-less-wrapper-165'
      bodyStyle={{ padding: '0 18px', marginTop: 18 }}
    >
      {type && modelId && (
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
      )}
    </Card>
  )
})

export default List
