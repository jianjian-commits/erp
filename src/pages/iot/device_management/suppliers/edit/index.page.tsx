import React from 'react'
import { useGMLocation } from '@gm-common/router'
import Details from '../components/details'

const SupplierEditPage = () => {
  const { supplier_id } = useGMLocation<{
    supplier_id: string
  }>().query

  return <Details isEdit supplier_id={supplier_id} />
}

export default SupplierEditPage
