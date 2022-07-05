import { usePagination } from '@gm-common/hooks'
import { BoxPagination, Pagination } from '@gm-pc/react'
import { BomType } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

/**
 * BOM列表筛选条件的属性
 */
interface Query {
  /** BOM的种类 */
  type?: BomType
  /** 是否在全部标签页 */
  isAll?: boolean
  /** 关联BOM的商品BOM */
  sku_id?: string
  /** 是否在关联BOM页 */
  isRelationBom?: boolean
}

/**
 * BOM完整列表的组件函数
 */
const BomList: FC<Query> = ({ type, isAll, sku_id, isRelationBom }) => {
  // 获取BOM列表和分页信息
  const { paging, runChangePaging, run, refresh, refreshAfterDelete } =
    usePagination<any>(
      (params) =>
        store.fetchBomList({
          ...params,
          material_sku_ids: sku_id ? [sku_id] : undefined,
        }),
      {
        defaultPaging: {
          need_count: true,
        },
        paginationKey: '' + type,
      },
    )

  // 每次更新搜索条件时更新列表
  useEffect(() => {
    store.updateFilterObject({
      type,
      isAll,
    })
    run()
    return () => {
      store.initData()
    }
  }, [])

  return (
    <div className='b-bomList'>
      {!isRelationBom && <Filter type={type!} onSearch={run} />}
      <div
        style={
          isRelationBom
            ? {}
            : {
                height: 'calc(100vh - 140px)',
                background: '#fff',
                border: '16px solid #f1f1f1',
                overflowY: 'auto',
              }
        }
      >
        <List
          type={type}
          onSearch={refresh}
          onSearchDelete={refreshAfterDelete}
          isRelationBom={isRelationBom}
        />
        <BoxPagination>
          <Pagination paging={paging} onChange={runChangePaging} />
        </BoxPagination>
      </div>
    </div>
  )
}

export default observer(BomList)
