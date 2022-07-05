import React from 'react'
import { observer } from 'mobx-react'

import { PropsType } from '../interface'
import { TableList } from '@gm-pc/business'

export default observer((props: PropsType) => {
  const { id, columns, filter, service, summaryInfo } = props

  return (
    <TableList
      {...props}
      isDiy
      isHeaderSort
      filter={filter}
      service={service}
      id={id}
      paginationOptions={{
        paginationKey: id,
        defaultPaging: { need_count: true },
      }}
      keyField='id'
      columns={columns}
      totalTextData={summaryInfo}
    />
  )
})
