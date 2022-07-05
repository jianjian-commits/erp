import HeaderTip from '@/common/components/header_tip'
import { toFixed } from '@/pages/production/util'
import globalStore from '@/stores/global'
import { BoxPanel, Flex } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { ProcessTaskCommand, ProcessTask_Input } from 'gm_api/src/production'
import _ from 'lodash'
import React, { FC, useMemo } from 'react'
import '../../../../../style.less'
import taskCommandStore from '../../../task/store'
import HeatTable from '../components/head_table'
import store from '../store'

interface Props {
  is_pack: boolean
}

const Process: FC<Props> = ({ is_pack }) => {
  const { list, skuList } = store
  const task_data = list.process_task?.inputs?.inputs || []
  const command_data = list.process_task_commands || []

  const columns = _.reduce(
    task_data,
    (all, value, index) => {
      const isLast = index === task_data.length - 1
      return all.concat({
        Header: (
          <HeatTable
            sku_name={skuList[value.material?.sku_id!]?.sku?.name!}
            isLast={isLast}
          />
        ),
        accessor: 'input_name',
        Cell: (cellProps) => {
          const { inputs } = cellProps.original as ProcessTaskCommand
          const { plan_amount, actual_amount, unit_id } =
            inputs!.inputs![index]!.material!
          return (
            <Flex
              className={classNames('b-tr-height ', {
                'b-flex-margin-8': !isLast,
                'b-flex-margin-20': isLast,
              })}
            >
              <Flex className='b-tr-div b-tr-border' alignCenter>
                {toFixed(plan_amount) + globalStore.getUnitName(unit_id!)}
              </Flex>
              <Flex className='b-tr-div' alignCenter>
                {toFixed(actual_amount || '0') +
                  globalStore.getUnitName(unit_id!)}
              </Flex>
            </Flex>
          )
        },
      })
    },
    [] as any,
  )

  const task_columns: Column<ProcessTask_Input>[] = useMemo(
    () => [
      {
        Header: t('物料'),
        accessor: 'input_name',
        Cell: (cellProps) => {
          const { material } = cellProps.original
          return skuList[material!.sku_id!]!.sku!.name
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column alignCenter>
                <span>{t('理论用料')}</span>
                <span>{is_pack ? '(基本单位)' : undefined}</span>
              </Flex>
            }
          />
        ),
        accessor: 'main_plan',
        Cell: (cellProps) => {
          const { material } = cellProps.original
          const { unit_id, plan_amount } = material!
          return toFixed(plan_amount) + globalStore.getUnitName(unit_id!)
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column alignCenter>
                <span>{t('实际用料')}</span>
                <span>{is_pack ? '(基本单位)' : undefined}</span>
              </Flex>
            }
          />
        ),
        accessor: 'main_actual',
        Cell: (cellProps) => {
          const { material } = cellProps.original
          const { unit_id, actual_amount } = material!
          return (
            toFixed(actual_amount || '0') + globalStore.getUnitName(unit_id!)
          )
        },
      },
    ],
    [],
  )

  const command_columns = useMemo(
    (): Column<ProcessTaskCommand>[] => [
      {
        Header: t('指令编号'),
        accessor: 'sequence_no',
        Cell: (cellProps) => {
          const { sequence_no } = cellProps.original
          return `${list!.process_task!.serial_no}-${sequence_no}`
        },
      },
      {
        Header: t('关联小组'),
        accessor: 'processor',
        Cell: (cellProps) => {
          const { processor } = cellProps.original
          return <div>{taskCommandStore.getProcessorName(processor || '')}</div>
        },
      },
      ...columns,
    ],
    [task_data],
  )

  return (
    <>
      <BoxPanel title={t('任务用料明细')} collapse>
        <Table columns={task_columns} data={task_data.slice()} border />
      </BoxPanel>
      <BoxPanel title={t('指令用料明细')} collapse>
        <Table columns={command_columns} data={command_data.slice()} border />
      </BoxPanel>
    </>
  )
}

export default Process
