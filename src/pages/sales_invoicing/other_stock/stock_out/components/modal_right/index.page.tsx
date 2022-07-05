import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { Pagination, BoxPagination } from '@gm-pc/react'
import TableListTips from '@/common/components/table_list_tips'
import { usePagination } from '@gm-common/hooks'

import Filter from './filter'
import List from './list'
import detailStore from '../../stores/detail_store'

type ModalRightDataProps = {
  onHide: () => void
}

const ModalRightData: FC<ModalRightDataProps> = ({ onHide }) => {
  const { paging, runChangePaging, run } = usePagination<any>(
    (params) => detailStore.fetchStockSheetList(params),
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'otherStockStockOutModal',
    },
  )
  const {
    modalRightFilter: { q },
  } = detailStore
  useEffect(() => {
    run()
    detailStore.fetchSupplier()
  }, [])
  return (
    <>
      <Filter onSearch={run} />
      <TableListTips
        tips={[
          q +
            t(
              '说明： 选择需要的入库单进行复制，系统会自动将入库单明细和批次信息复制出库单中，未提交入库单无法选择',
            ),
        ]}
      />
      <List onHide={onHide} />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
}

export default ModalRightData
