import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import moment from 'moment'
import TableListTips from '@/common/components/table_list_tips'
import store from '../store'
import {
  map_Sku_NotPackageSubSkuType,
  Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'

interface Props {}

const List: FC<Props> = observer(() => {
  const { data } = store
  const columns: any[] = []
  const field_values = data?.[0]?.field_values || []
  field_values.forEach((field) => {
    let val = field.val
    if (field.name === '商品类型') {
      val =
        map_Sku_NotPackageSubSkuType[Sku_NotPackageSubSkuType[field.val as any]]
    }
    columns.push({
      Header: t(field.name as string),
      accessor: 'name',
      minWidth: 100,
      Cell: () => {
        return <div>{val}</div>
      },
    })
  })
  return (
    <>
      <TableListTips
        tips={[
          store.updateTime === '0' || store.updateTime === ''
            ? t('统计时间约10分钟统计更新一次')
            : t(
                `统计时间约10分钟统计更新一次，最近更新时间${moment(
                  new Date(+store.updateTime),
                ).format('YYYY-MM-DD HH:mm:ss')}`,
              ),
        ]}
      />
      <BoxTable info='商品列表'>
        <Table
          data={data.slice()}
          loading={store.loading}
          columns={columns as any}
        />
      </BoxTable>
    </>
  )
})

export default List
