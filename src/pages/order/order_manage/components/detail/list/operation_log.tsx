import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Column, Table } from '@gm-pc/table-x'

import { Card, Space } from 'antd'

import { Log, ListLog, LogModelType } from 'gm_api/src/logsystem'
import moment from 'moment'
import store from '../../../components/detail/store'
import _ from 'lodash'

/** 订单操作日志 */
const OperationLog = () => {
  const [list, setList] = useState<Log[]>([])

  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = () => {
    const detailIds: string[] = []
    if (store.order.order_details?.order_details) {
      _.forEach(store.order.order_details.order_details, (detailItem) => {
        if (detailItem.order_detail_id) {
          detailIds.push(detailItem.order_detail_id)
        }
      })
    }

    return ListLog({
      log_model_types: [
        LogModelType.LOGMODELTYPE_ORDER,
        LogModelType.LOGMODELTYPE_ORDERDETAIL,
      ],
      model_id_or_relation_ids: [store.order.order_id, ...detailIds],
      paging: { offset: 0, all: true },
      sortby: [
        {
          // 时间逆序
          field: 3,
          desc: true,
        },
      ],
    }).then((res) => {
      setList(res.response.logs)
      console.log('res', res.response)
    })
  }

  const columns: Column<Log>[] = [
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
      bodyStyle={{ padding: '30px 10px' }}
    >
      <Table
        id='log_list'
        keyField='log_id'
        data={list}
        columns={columns}
        headerProps={{ hidden: true }}
        isPagination={false}
      />
    </Card>
  )
}

export default OperationLog
