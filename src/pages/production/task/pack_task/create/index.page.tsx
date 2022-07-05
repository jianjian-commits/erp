import React from 'react'
import { Task_Type } from 'gm_api/src/production'

import Create from '../../../create'

const TaskCreate = () => {
  return <Create type={Task_Type.TYPE_PACK} />
}

export default TaskCreate
