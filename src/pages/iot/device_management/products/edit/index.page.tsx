import React from 'react'
import { useGMLocation } from '@gm-common/router'
import Details from '../components/details'

const ProductEditPage = () => {
  const { model_id } = useGMLocation<{
    model_id: string
  }>().query
  return <Details isEdit model_id={model_id} />
}

export default ProductEditPage
