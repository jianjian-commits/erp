import React, { useEffect } from 'react'
import { toJS } from 'mobx'
import { Tabs } from 'antd'
import SyncSearchFilter from '@/pages/sync/components/sync_filter'
import SyncList from '@/pages/sync/components/sync_list'
import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'
import store from './store'
import './style.less'

const { TabPane } = Tabs

/**
 * 同步页面的组件函数
 */
const SyncSAPPage = () => {
  /**
   * 通过usePagination获取paging属性，run和runChangePaging函数
   * run用于获取同步记录并分页
   * paging用于设置分页，runChangePaging用于处理换页事件
   */
  const { paging, run, runChangePaging } = usePagination<any>(
    store.fetchSyncList,
    {
      paginationKey: 'sync_list',
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    run()
  }, [])

  /**
   * 渲染组件
   */
  return (
    <div className='gm-sync-wrap'>
      <Tabs defaultActiveKey='1'>
        <TabPane tab='同步消息' key='1'>
          <SyncSearchFilter onSearch={run} />
          <SyncList data={toJS(store.syncRecords)} afterSync={run} />
          <BoxPagination>
            <Pagination paging={paging} onChange={runChangePaging} />
          </BoxPagination>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default SyncSAPPage
