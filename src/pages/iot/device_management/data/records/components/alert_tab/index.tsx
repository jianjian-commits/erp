import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'
import { SortsType } from '@gm-pc/table-x'
import { SortBy } from 'gm_api/src/common'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import AlertList from './components/alert_list'
import SearchFilter from './components/search_filter'
import store from './store'

/**
 * 报警记录标签页的属性
 */
interface AlertRecordTabProps {
  /** 设备类型 */
  type: number
  /** 设备型号ID */
  modelId?: string
  /** 设备名 */
  name?: string
}

/**
 * 报警记录标签页的组件函数
 */
const AlertRecordTab: FC<AlertRecordTabProps> = observer(
  ({ type, modelId, name }) => {
    /**
     * 通过usePagination获取paging属性，run和runChangePaging函数
     * run用于获取报警记录并分页
     * paging用于设置分页，runChangePaging用于处理换页事件
     */
    const { paging, run, runChangePaging } = usePagination<any>(
      store.fetchAlertRecords,
      {
        paginationKey: 'alert_tab',
        defaultPaging: {
          need_count: true,
        },
      },
    )

    /**
     * 对报警记录排序
     * @param {SortsType} sort 排序设置
     */
    const onSort = (sort: SortsType) => {
      let sortBy: SortBy[] = []
      if (Object.keys(sort).length) {
        const field = +Object.keys(sort)[0]
        const desc = Object.values(sort)[0] === 'desc'
        sortBy = [{ field, desc }]
      }
      store.updateFilter('sortby', sortBy)
      run()
    }

    useEffect(() => {
      store.initFilter(type, modelId, name)
      run()
    }, [])

    /**
     * 渲染组件
     */
    return (
      <div>
        <SearchFilter type={type} onSearch={run} model={modelId} name={name} />
        <AlertList onSort={onSort} />
        <BoxPagination>
          <Pagination paging={paging} onChange={runChangePaging} />
        </BoxPagination>
      </div>
    )
  },
)

export default AlertRecordTab
