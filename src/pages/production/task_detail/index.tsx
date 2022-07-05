import { Flex, Tabs } from '@gm-pc/react'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { map_Task_State, Task_State, Task_Type } from 'gm_api/src/production'
import { observer, Observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import TaskDetail from './detail'
import PlanSource from './plan/index'
import store from './store'
import './style.less'

interface DetailProps {
  task_id: string
  type?: Task_Type
  task_state: number
}

const Detail: FC<DetailProps> = observer(({ task_id, type, task_state }) => {
  useEffect(() => {
    store.fetchFactoryModalList()
    // 获取生产计划详情
    store.getTaskDetail(task_id).then(() => {
      // 获取BOM
      return store.getBom()
    })
    // 重置一下tab
    store.setActiveTab('1')
    return () => store.initData()
  }, [task_id])

  return (
    <Flex column>
      <Flex
        alignCenter
        className='gm-padding-tb-10 gm-padding-lr-20 gm-text-14'
      >
        <div
          className={classNames('b-task-status', {
            'b-task-status-unpublished':
              task_state === Task_State.STATE_PREPARE,
            'b-task-status-ongoing': task_state === Task_State.STATE_STARTED,
            'b-task-status-finished': task_state === Task_State.STATE_FINISHED,
            'b-task-status-abandoned': task_state === Task_State.STATE_VOID,
          })}
        >
          {map_Task_State[task_state] || ''}
        </div>
        <strong className='gm-margin-lr-10'>
          {store?.taskDetails?.task?.sku_name}
        </strong>
      </Flex>
      <Flex column className='gm-padding-bottom-15'>
        <Observer>
          {() => {
            const { activeTab } = store
            return (
              <Tabs
                key={activeTab}
                tabs={[
                  {
                    text: t('需求明细'),
                    value: '1',
                    children: <TaskDetail type={type} />,
                  },
                  {
                    text: t('需求来源'),
                    value: '2',
                    children: <PlanSource />,
                  },
                ].filter(Boolean)}
                active={activeTab}
                onChange={(active) => {
                  store.setActiveTab(active)
                }}
              />
            )
          }}
        </Observer>
      </Flex>
    </Flex>
  )
})

export default Detail
