import { Select, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import _ from 'lodash'
import React, { FC, useMemo, useState } from 'react'
import './style.less'
import useReferencePrice from './use_reference_price'
import TableTextOverflow from '@/common/components/table_text_overflow'

interface ReferencePriceProps {
  quotationId: string
  skuId: string
}

const enum CYCLE {
  THREE = 3,
  SIX = 6,
}

const CYCLE_COUNTS_OPTIONS = [
  { label: t('近3周期'), value: CYCLE.THREE },
  { label: t('近6周期'), value: CYCLE.SIX },
]

interface ReferencePriceData {
  name: string
  unit: string
  price: string
  count?: number
}

const columns: ColumnsType<ReferencePriceData> = [
  {
    title: t('周期'),
    dataIndex: 'name',
    onCell: (record) => {
      const { count = 0 } = record
      return { rowSpan: count }
    },
    render(e) {
      return <TableTextOverflow text={e} maxLength={12} />
    },
  },
  {
    title: t('下单单位'),
    dataIndex: 'unit',
  },
  {
    title: t('商品单价'),
    dataIndex: 'price',
  },
]
const ReferencePrice: FC<ReferencePriceProps> = (props) => {
  const { quotationId, skuId } = props

  const [cycleCounts, setCycleCounts] = useState<CYCLE>(CYCLE.THREE)

  const { data, loading } = useReferencePrice({
    quotationId,
    skuId,
    cycle: cycleCounts,
  })
  const list = useMemo(() => {
    const result: ReferencePriceData[] = []
    _.forEach(data, (item) => {
      _.forEach(item.list, (v, index) => {
        result.push({
          count: index === 0 ? _.size(item.list) : undefined,
          name: item.name,
          unit: v.unit,
          price: v.price,
        })
      })
    })
    return result
  }, [data])

  return (
    <>
      <div className='reference_price_cycle'>
        <Select
          options={CYCLE_COUNTS_OPTIONS}
          value={cycleCounts}
          onChange={setCycleCounts}
        />
      </div>

      <Table
        pagination={false}
        scroll={{ y: 360 }}
        columns={columns}
        dataSource={list}
        loading={loading}
        bordered
      />
    </>
  )
}

export default ReferencePrice
