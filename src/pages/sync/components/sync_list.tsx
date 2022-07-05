import { TableListColumn } from '@gm-pc/business'
import { Button, Popover, Tip } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { map_Model_Type } from 'gm_api/src/common'
import {
  APIRequestRecord,
  APIRequestRecord_SyncStatus,
  map_APIRequestRecord_SyncStatus,
} from 'gm_api/src/sap'
import moment from 'moment'
import React, { FC } from 'react'
import store from '../store'
import '../style.less'

/**
 * 同步列表的属性
 */
interface SyncListProps {
  /** 同步记录数据 */
  data: APIRequestRecord[]
  /** 同步后执行的动作 */
  afterSync: Function
}

/**
 * 同步列表的组件函数
 */
const SyncList: FC<SyncListProps> = ({ data, afterSync }) => {
  /**
   * 重新同步，显示同步结果并刷新列表
   * @param {string} recordId 同步的记录ID
   */
  const resync = (recordId: string) => {
    store
      .resyncAPIRecords(recordId)
      .then((response) => {
        if (!response.response.api_request_record) {
          Tip.danger(t('同步失败'))
        } else {
          const { sync_status } = response.response.api_request_record
          sync_status === 1
            ? Tip.success(t('同步成功'))
            : Tip.danger(t('同步失败'))
        }
        afterSync()
      })
      .catch(() => {
        Tip.danger(t('同步失败'))
        afterSync()
      })
  }

  /**
   * 渲染失败状态的弹窗信息
   * @param  {string}      message 失败信息
   * @return {JSX.Element}         失败状态的弹窗
   */
  const renderFailureMessage = (message: string) => {
    return <div style={{ width: '150px' }}>{`失败原因：${message}`}</div>
  }

  /**
   * 同步列表的栏
   */
  const columns: TableListColumn<APIRequestRecord>[] = [
    {
      Header: t('平台'),
      accessor: 'platform',
    },
    {
      Header: t('模块'),
      accessor: ({ model_type }) =>
        model_type ? map_Model_Type[model_type] : '-',
    },
    {
      Header: t('数据类型'),
      accessor: 'data_type',
    },
    {
      Header: t('单据编号'),
      accessor: 'data_sn',
    },
    {
      Header: t('同步时间'),
      accessor: ({ req_time }) =>
        moment(req_time, 'x').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      Header: t('同步状态'),
      accessor: ({ sync_status, remarks }) => {
        // 只有失败和取消状态的记录标红，同时失败状态的带有弹窗信息，其他正常
        switch (sync_status) {
          case APIRequestRecord_SyncStatus.STATUS_SUCCESS:
            return map_APIRequestRecord_SyncStatus[1]

          case APIRequestRecord_SyncStatus.STATUS_FAILURE:
            return (
              <Popover
                type='hover'
                className='sync-failed-message'
                popup={renderFailureMessage(remarks || t('位置原因'))}
                showArrow
                arrowLeft='8px'
              >
                <div className='sync-failed-text'>
                  {map_APIRequestRecord_SyncStatus[2]}
                </div>
              </Popover>
            )

          case APIRequestRecord_SyncStatus.STATUS_CANCELED:
            return (
              <div className='sync-cancelled-text'>
                {map_APIRequestRecord_SyncStatus[3]}
              </div>
            )

          default:
            return t('未知状态')
        }
      },
    },
    {
      Header: t('操作'),
      accessor: ({ api_request_record_id, sync_status }) => {
        // 只有失败状态的记录有重新同步的按钮，其他都为空
        return sync_status === APIRequestRecord_SyncStatus.STATUS_FAILURE ? (
          <div>
            <Button
              type='link'
              style={{ padding: '0px', textDecoration: 'underline' }} // 因为Button里定义了className，所以这里必须用style
              onClick={() => {
                resync(api_request_record_id)
              }}
            >
              {t('重新同步')}
            </Button>
          </div>
        ) : (
          ''
        )
      },
    },
  ]

  /**
   * 渲染组件
   */
  return <Table<APIRequestRecord> columns={columns} data={data} />
}

export default SyncList
