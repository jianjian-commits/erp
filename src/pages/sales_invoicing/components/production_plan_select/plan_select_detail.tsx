import React, { FC, useEffect, useState } from 'react'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import PlanDetailTable from './plan_detail_table'

import { TaskDetail } from '../../sales_invoicing_type'
import { GetTask } from 'gm_api/src/production'
import { adapterTaskList } from './util'

interface PlanSelectProps {
  taskId: string
  skuId?: string
}

const PlanSelectDetail: FC<PlanSelectProps> = (props) => {
  const { taskId, skuId } = props

  const [data, setData] = useState<TaskDetail[]>([])

  useEffect(() => {
    GetTask({ task_id: taskId }).then((json) => {
      setData(
        adapterTaskList(
          {
            task_details: [
              {
                task: json.response.task,
                task_processes: json.response.task_processes,
                task_orders: json.response.task_orders,
                task_inputs: json.response.task_inputs,
              },
            ],
            skus: json.response.skus,
            units: json.response.units,
          },
          skuId,
        ),
      )

      return json
    })
  }, [])

  return (
    <Flex column>
      {t('已选计划')}
      {/* 已选择的表格数据 */}
      <PlanDetailTable data={data} />
    </Flex>
  )
}

export default PlanSelectDetail
