import { BomType } from 'gm_api/src/production'
import React from 'react'
import { BomList } from '../components'

const PackBomManagementPage = () => {
  return (
    <>
      <BomList type={BomType.BOM_TYPE_PACK} />
    </>
  )
}

export default PackBomManagementPage
