import { useGMLocation } from '@gm-common/router'
import {
  observer,
  useLocalObservable,
  useLocalStore,
  useObserver,
} from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import store, { PDetail } from '../../stores/detail_store'

interface Props {
  index: number
  data: PDetail
}

const SupplierCell: FC<Props> = observer((props) => {
  const location = useGMLocation<{ sheet_id: string }>()
  const { sheet_id } = location.query
  const { index, data } = props
  const { batch_selected_single, supplier_info, sku_id, unit_id } = data

  const [supplier_name, setName] = useState('')

  useEffect(() => {
    if (batch_selected_single?.supplier_id) {
      setName(
        store.supplierList.filter(
          (item) => item?.supplier_id === batch_selected_single?.supplier_id,
        )[0]?.name ?? '-',
      )
    }
  }, [batch_selected_single])

  useEffect(() => {
    if (sheet_id) {
      setName(supplier_info?.name)
    }
    if (!sku_id || !unit_id) {
      setName('-')
    }
  }, [sku_id, unit_id, sheet_id, supplier_info])

  // if (sheet_id) {
  //   return <span>{supplier_info?.name}</span>
  // }

  return <span>{supplier_name}</span>
})

export default SupplierCell
