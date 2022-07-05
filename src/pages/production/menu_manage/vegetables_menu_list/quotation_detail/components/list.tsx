import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import QuotationDetailTable from '@/common/components/quotation_detail'
import { useGMLocation } from '@gm-common/router'

const List = observer(() => {
  const location = useGMLocation<{ quotation_id?: string }>()
  const { quotation_id } = location.query
  const { searchNum } = store
  const { menu_from_time, menu_to_time } = store.filter
  const { valid_start, valid_end } = store.quotation
  const ref: any = useRef(null)

  useEffect(() => {
    if (searchNum) fetchList()
  }, [searchNum])

  const fetchList = () => {
    if (typeof ref.current?.fetchList === 'function') ref.current?.fetchList()
  }
  return (
    <QuotationDetailTable
      ref={ref}
      source='vegetables'
      quotation_id={quotation_id}
      menu_from_time={menu_from_time!}
      menu_to_time={menu_to_time!}
      valid_begin={valid_start!}
      valid_end={valid_end!}
      show_import
    />
  )
})

export default List
