import HeaderTip from '@/pages/production/plan_management/plan/task/components/list/components/header_tip'
import { Flex } from '@gm-pc/react'
import { Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import {
  map_ProcessTask_State,
  ProcessTaskCommand,
  ProduceType,
} from 'gm_api/src/production'
import React, { FC } from 'react'
import { descTest, headTest } from '../../../../../../util'
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

  const subColumn: ColumnType<ProcessTaskCommand>[] = [
    {
      title: t('指令编号'),
      dataIndex: 'serial_no',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const { sequence_no } = v
        return `${list[process_index]!.process_task!.serial_no}-${sequence_no}`
      },
    },
    {
      title: t('关联小组'),
      dataIndex: 'processor',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const { processor } = v
        return <div>{store.getProcessorName(processor!)}</div>
      },
    },
    {
      title: () => (
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
      dataIndex: 'outputs',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const {
          inputs: { inputs },
          main_output,
        } = v
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
      title: () => (
        <HeaderTip
          header={
            <Flex column justifyCenter alignCenter>
              <span>{headTest(isPack, '理论', '产出')}</span>
              <span>{descTest(isPack, '包装')}</span>
            </Flex>
          }
        />
      ),
      dataIndex: 'outputs',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const { main_output } = v
        const material = main_output?.material!
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
      title: () => (
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
      dataIndex: 'outputs',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const {
          inputs: { inputs },
          main_output,
        } = v
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
      title: () => (
        <HeaderTip
          header={
            <Flex column justifyCenter alignCenter>
              <span>{headTest(isPack, '实际', '产出')}</span>
              <span>{descTest(isPack, '包装')}</span>
            </Flex>
          }
        />
      ),
      dataIndex: 'outputs',
      width: 140,
      align: 'center',
      render: (_, v) => {
        const { main_output } = v
        const material = main_output?.material
        return (
          <>
            {isPack ? (
              <PackAmount
                material={material!}
                type={AMOUT_TYPE.actual}
                ssuInfo={list[process_index].ssuInfo!}
              />
            ) : (
              <ProductionAmount material={material!} type='actual' />
            )}
          </>
        )
      },
    },
    {
      title: t('指令状态'),
      dataIndex: 'state',
      width: 140,
      render: (_, v) => {
        const { state } = v
        return map_ProcessTask_State[state!]
      },
    },
  ]
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Table
        id={'process_task_command_id' + process_index}
        pagination={false}
        dataSource={list[process_index].process_task_commands?.slice()!}
        columns={subColumn}
      />
    </div>
  )
}

export default SubTableIndex
