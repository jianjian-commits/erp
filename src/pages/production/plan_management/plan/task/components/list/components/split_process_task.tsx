import { toFixed } from '@/pages/production/util'
import { KCInputNumber } from '@gm-pc/keyboard'
import { Button, Flex, Modal, Tip } from '@gm-pc/react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { ProcessTaskCommand } from 'gm_api/src/production'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import React, { FC, useCallback, useEffect, useMemo } from 'react'
import type { SplitTaskType } from '../../../interface'
import store from '../../../store'
import SelectProcessor from './select_processor'

interface Props {
  unitName: string
  process_task_id: string
  parentProcessor: string
  splitPrepareList: ProcessTaskCommand[]
}

const { TABLE_X, OperationHeader, OperationCell, EditOperation } = TableXUtil

const SplitProcessTask: FC<Props> = ({
  process_task_id,
  unitName,
  parentProcessor,
  splitPrepareList,
}) => {
  const { splitTask } = store

  // 未开工指令
  useEffect(() => {
    store.fetchFactoryModalList()
    store.getSplitTask(
      _.map(splitPrepareList, (v) => ({
        _plan_amount: +toFixed(v.main_output?.material?.plan_amount!),
        plan_amount: +toFixed(v.main_output?.material?.plan_amount!),
        processor: v.processor!,
        state: v.state!,
      })),
    )
    return () => store.getSplitTask([])
  }, [])

  // 不使用task的数据是因为需要筛选未开工的
  const planAmount = useMemo(() => {
    return _.reduce(
      splitTask,
      (all, { plan_amount }) => Big(all).add(plan_amount),
      Big(0),
    )
  }, [splitTask[0]?.state])

  const actualAmount = +planAmount.minus(
    _.reduce(
      splitTask,
      (all, { _plan_amount }) => Big(all).add(_plan_amount! || 0),
      Big(0),
    ),
  )

  const handleAddRow = useCallback(() => {
    store.addRowSplitTask()
  }, [])

  const handleDeleteROw = (index: number) => {
    store.deleteRowSplitTask(index)
  }

  const handleUpdateRow = <T extends keyof SplitTaskType>(
    index: number,
    key: '_plan_amount' | 'processor',
    value: SplitTaskType[T],
  ): void => {
    store.updateRowSplitTask(index, key, value)
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleSplit = () => {
    if (actualAmount < 0) {
      Tip.tip(t('待分配数量不得小于0'))
      return
    }
    if (actualAmount > 0) {
      Tip.tip(t('尚有未分配的数量'))
      return
    }
    store.updateSplitTask(process_task_id).then(() => {
      Tip.success(t('拆分成功'))
      handleCancel()
      store.doRequest()
      return null
    })
  }

  const columns = useMemo(
    (): Column<SplitTaskType>[] => [
      {
        Header: t('序号'),
        id: 'index',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          return <div>{cellProps.index + 1}</div>
        },
      },
      {
        Header: OperationHeader,
        id: 'operation',
        fixed: 'left',
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                return (
                  <OperationCell>
                    <EditOperation
                      onAddRow={handleAddRow}
                      onDeleteRow={
                        store.splitTask.length > 1
                          ? () => handleDeleteROw(cellProps.index)
                          : undefined
                      }
                    />
                  </OperationCell>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('理论产出数量'),
        accessor: 'amount',
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { _plan_amount } = cellProps.original
                return (
                  <KCInputNumber
                    value={_plan_amount}
                    onChange={(value: number | null) => {
                      handleUpdateRow(cellProps.index, '_plan_amount', value!)
                    }}
                    min={0}
                    precision={4}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('关联小组'),
        accessor: 'processor',
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const {
                  index: cellIndex,
                  original: { processor },
                } = cellProps
                return (
                  <SelectProcessor
                    isKeyboard
                    processor={processor}
                    parentId={parentProcessor}
                    onChange={(value: string) =>
                      handleUpdateRow(cellIndex, 'processor', value)
                    }
                  />
                )
              }}
            </Observer>
          )
        },
      },
    ],
    [],
  )

  return (
    <>
      <div className='gm-text-red gm-padding-left-10'>
        {t('* 拆分后的数量需等于当前任务理论产出数量')}
      </div>
      <Flex className='gm-padding-10 gm-text-14'>
        <span className='gm-margin-right-10'>{t('理论产出数量: ')}</span>
        <span>{planAmount + unitName}</span>
        <span className='gm-margin-left-10 gm-margin-right-10'>
          {t('待分配数量: ')}
        </span>
        <span>{toFixed('' + actualAmount) + unitName}</span>
      </Flex>
      <Table
        isKeyboard
        isEdit
        isVirtualized
        limit={5}
        id='task_split'
        tiled
        columns={columns}
        onAddRow={handleAddRow}
        data={splitTask.slice()}
      />
      <Flex justifyEnd className='gm-padding-10'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleSplit}>
          {t('确定')}
        </Button>
      </Flex>
    </>
  )
}

export default observer(SplitProcessTask)
