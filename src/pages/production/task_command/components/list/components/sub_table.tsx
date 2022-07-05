import HeaderTip from '@/common/components/header_tip'
import { Flex } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { map_ProcessTask_State, ProduceType } from 'gm_api/src/production'
import React, { FC, useMemo } from 'react'
import { descTest, headTest } from '../../../../util'
import { AMOUT_TYPE } from '../../../enum'
import store from '../../../store'
import PackAmount from './pack_amount'
import ProductionAmount from './production_amount'

interface SubProps {
  process_index: number
  type?: ProduceType
}

const SubTableIndex: FC<SubProps> = ({ process_index, type }) => {
  const { list } = store
  const isPack = type === ProduceType.PRODUCE_TYPE_PACK
  const commandInfo =
    type === ProduceType.PRODUCE_TYPE_DELICATESSEN
      ? t('组合工序不展示用料数量，可点击工单编号在详情中查看')
      : undefined
  const subColumn: Column[] = useMemo(
    () => [
      {
        Header: t('指令编号'),
        accessor: 'serial_no',
        minWidth: 140,
        Cell: (cellProps) => {
          const { sequence_no } = cellProps.original
          return `${
            list[process_index]!.process_task!.serial_no
          }-${sequence_no}`
        },
      },
      {
        Header: t('关联小组'),
        accessor: 'processor',
        minWidth: 140,
        Cell: (cellProps) => {
          const { processor } = cellProps.original
          return <div>{store.getProcessorName(processor)}</div>
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '理论', '用料')}</span>
                <span>{t('（基本单位）')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        accessor: 'outputs',
        minWidth: 140,
        Cell: (cellProps) => {
          const {
            inputs: { inputs },
            main_output,
          } = cellProps.original
          const material = inputs[0]?.material
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={main_output!.material!}
                  isBaseUnit
                  type={AMOUT_TYPE.plan}
                  ssuInfo={list[process_index].ssuInfo!}
                  packRate={list[process_index].packRate}
                />
              ) : (
                <ProductionAmount
                  material={material}
                  type='plan'
                  hidden={inputs.length >= 2}
                />
              )}
            </>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '理论', '产出')}</span>
                <span>{descTest(isPack, '包装')}</span>
              </Flex>
            }
          />
        ),
        accessor: 'outputs',
        minWidth: 140,
        Cell: (cellProps) => {
          const { main_output } = cellProps.original
          const material = main_output?.material
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.plan}
                  ssuInfo={list[process_index].ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='plan' />
              )}
            </>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '实际', '投料')}</span>
                <span>{t('（基本单位）')}</span>
              </Flex>
            }
            tip={commandInfo}
          />
        ),
        accessor: 'outputs',
        minWidth: 140,
        Cell: (cellProps) => {
          const {
            inputs: { inputs },
            main_output,
          } = cellProps.original
          const material = inputs[0]?.material
          return (
            <>
              {isPack ? (
                <PackAmount
                  isBaseUnit
                  material={main_output!.material!}
                  type={AMOUT_TYPE.baseUnitActual}
                  ssuInfo={list[process_index].ssuInfo!}
                />
              ) : (
                <ProductionAmount
                  material={material}
                  type='actual'
                  hidden={inputs.length >= 2}
                />
              )}
            </>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={
              <Flex column justifyCenter alignCenter>
                <span>{headTest(isPack, '实际', '产出')}</span>
                <span>{descTest(isPack, '包装')}</span>
              </Flex>
            }
          />
        ),
        accessor: 'outputs',
        minWidth: 140,
        Cell: (cellProps) => {
          const { main_output } = cellProps.original
          const material = main_output?.material
          return (
            <>
              {isPack ? (
                <PackAmount
                  material={material}
                  type={AMOUT_TYPE.actual}
                  ssuInfo={list[process_index].ssuInfo!}
                />
              ) : (
                <ProductionAmount material={material} type='actual' />
              )}
            </>
          )
        },
      },
      {
        Header: t('指令状态'),
        accessor: 'state',
        minWidth: 140,
        Cell: (cellProps) => {
          const { state } = cellProps.original
          return map_ProcessTask_State[state]
        },
      },
    ],
    [],
  )

  return (
    <Table
      isSub
      id={'process_task_command_id' + process_index}
      data={list[process_index].process_task_commands?.slice()!}
      columns={subColumn}
    />
  )
}

export default SubTableIndex
