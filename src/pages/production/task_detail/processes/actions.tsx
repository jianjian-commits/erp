import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Modal } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import { Bom_Process_Type, OutputType } from 'gm_api/src/production'

import SVGTaskSplit from '@/svg/task_split.svg'
import TaskSplit from './components/task_split'
import store from '../store'
import { getUnitInfo, toFixed } from '../../util'
import { TaskProcessInfo } from '../interface'

interface ActionsProps {
  // index: number
  process_id: string
  isEditing: boolean
}

const { OperationCellRowEdit, OperationIcon } = TableXUtil

const Actions: FC<ActionsProps> = observer(({ process_id, isEditing }) => {
  const originals: TaskProcessInfo[] = _.filter(
    store.taskProcesses,
    (p) => p.process_id === process_id,
  )
  const combineProcess = _.find(
    store.taskProcesses,
    (p) =>
      p.bom_process_type === Bom_Process_Type.TYPE_COMBINED || p.rank === 100,
  )

  const handleEditTask = () => {
    _.forEach(originals, (o) => {
      store.updateTaskProcesses(o.index, 'isEditing', true)
    })
  }

  const handleEditTaskCancel = () => {
    _.forEach(originals, (o) => {
      store.updateTaskProcessesItem(o.index, {
        ...o,
        isEditing: false,
        processor_select: [],
      })
    })
  }

  const handleEditTaskSave = () => {
    _.forEach(originals, (o) => {
      // 更新processor_id, 重置processor_select
      let processor_id: string = o.processor || ''
      if (o.processor_select?.length) {
        processor_id = o?.processor_select[1] || o?.processor_select[0] || ''
      }
      store.updateTaskProcessesItem(o.index, {
        ...o,
        isEditing: false,
        processor: processor_id,
        // processor_select: [],
      })
      // 请求更新数据
      store.updateTaskProcess(o.index, processor_id)
    })
  }

  const handleSplitTask = () => {
    // 每次的初始理论产出都等于相同工序的理论产出之和，若originals.length === 1, 只有一个产出数，不需要计算
    let output_amount: string = ''
    let unit_name: string = ''
    const units = store.taskDetails.units

    if (originals.length === 1) {
      // 若是组合工序，获取成品的产出值，否则为工序本身产出值
      const process = originals[0]
      if (process.bom_process_type === Bom_Process_Type.TYPE_COMBINED) {
        const sku = _.find(
          (combineProcess && combineProcess.outputs?.outputs) || [],
          (o) => o.type === OutputType.OUTPUT_TYPE_MAIN,
        )
        output_amount = sku?.material?.plan_amount || '0'
        unit_name = getUnitInfo({
          unit_id: sku?.material?.unit_id || '',
          units: units!,
        }).unitName
      } else {
        output_amount =
          process.outputs?.outputs![0]?.material?.plan_amount || '0'
        unit_name = getUnitInfo({
          unit_id: process.outputs?.outputs![0]?.material?.unit_id || '',
          units: units!,
        }).unitName
      }
    } else {
      // 计算被拆分的工序加起来之和
      const outs = _.map(
        originals,
        (o) => o.outputs?.outputs![0].material?.plan_amount,
      )
      output_amount = toFixed(
        `${_.sumBy(outs, (out) => parseFloat(out || '0'))}`,
      )
      unit_name = getUnitInfo({
        unit_id: originals[0].outputs?.outputs![0]?.material?.unit_id || '',
        units: units!,
      }).unitName
    }

    Modal.render({
      children: (
        <TaskSplit
          actual_amount={toFixed(output_amount)}
          unit_name={unit_name}
          // process_id={originals[0].process_id!}
          selected={originals.slice()}
        />
      ),
      title: t('指令拆分'),
      size: 'md',
      onHide: Modal.hide,
    })
  }

  return (
    <OperationCellRowEdit
      isEditing={isEditing}
      onClick={() => handleEditTask()}
      onCancel={() => handleEditTaskCancel()}
      onSave={() => handleEditTaskSave()}
    >
      <OperationIcon onClick={handleSplitTask} tip={t('指令拆分')}>
        <SVGTaskSplit />
      </OperationIcon>
    </OperationCellRowEdit>
  )
})

export default Actions
