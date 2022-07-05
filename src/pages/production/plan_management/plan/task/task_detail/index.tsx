import { t } from 'gm-i18n'
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex, Tabs } from '@gm-pc/react'
import classNames from 'classnames'
import { ProcessTask_State, map_ProcessTask_State } from 'gm_api/src/production'

import PlanDetail from './plan_detail'
import ProcessDetail from './process_detail'

import '../../../../task_detail/style.less'

import store from './store'

interface DetailProps {
  process_task_id: string
  is_combine: boolean
  is_pack: boolean
}

const Detail: FC<DetailProps> = observer(
  ({ process_task_id, is_combine, is_pack }) => {
    const [tab, setTab] = useState('1')

    const {
      list: { process_task },
    } = store
    useEffect(() => {
      store.fetchList(process_task_id)
      return store.init
    }, [process_task_id])

    const state = process_task?.state

    return (
      <Flex column>
        <Flex
          alignCenter
          className='gm-padding-tb-10 gm-padding-lr-20 gm-text-14'
        >
          <div
            className={classNames('b-task-status', {
              'b-task-status-unpublished':
                state === ProcessTask_State.STATE_PREPARE,
              'b-task-status-ongoing':
                state === ProcessTask_State.STATE_STARTED,
              'b-task-status-finished':
                state === ProcessTask_State.STATE_FINISHED,
            })}
          >
            {map_ProcessTask_State[state!] || ''}
          </div>
          <strong className='gm-margin-lr-10'>
            {process_task?.process_name}
          </strong>
        </Flex>
        <Flex column className='gm-padding-bottom-15'>
          {is_combine ? (
            <Tabs
              key={tab}
              tabs={[
                {
                  text: t('需求明细'),
                  value: '1',
                  children: <PlanDetail is_pack={is_pack} />,
                },
                {
                  text: t('物料用料明细'),
                  value: '2',
                  children: <ProcessDetail is_pack={is_pack} />,
                },
              ]}
              active={tab}
              onChange={(active) => {
                setTab(active)
              }}
            />
          ) : (
            <PlanDetail is_pack={is_pack} />
          )}
        </Flex>
      </Flex>
    )
  },
)

export default Detail
