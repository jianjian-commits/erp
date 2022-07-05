import React from 'react'
import { Task_Type } from 'gm_api/src/production'

import MaterialDetail from '../../production_detail'

const Detail = () => {
  return <MaterialDetail type={Task_Type.TYPE_PRODUCE} />
}

export default Detail
