import React, { FC, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { Drawer, Tabs, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import './style.less'
import { t } from 'gm-i18n'
import { Task_State, Task_Category } from 'gm_api/src/asynctask'
import TaskList from './components/async_task_list'
import globalStore from '@/stores/global'
import store from './store'
import { Tasks } from './interface'

const { TabPane } = Tabs

// 样式
const bodyStyle = { padding: 0 }
const maskStyle = { backgroundColor: 'rgba(0, 0, 0, 0)' }

const TaskPanel: FC = observer(() => {
  const { tabList } = store
  const { taskVisible, taskTab } = globalStore

  // 当前tab下任务类型
  const [category, setCategory] = useState<Task_Category | null>(null)

  // 控制定时器状态
  const timerRef = useRef<NodeJS.Timer | null>(null)

  // 判断当前tab下是否存在未完成任务
  const allFinish = (list: Tasks) => {
    return (
      !list.length ||
      !_.find(list, (v) => Number(v.state) < Task_State.STATE_CANCELED)
    )
  }

  // 刷新任务列表
  const refreshTaskList = () => {
    if (!taskVisible) {
      clearTimer()
      return
    }

    store.getTaskList(getCategory(taskTab)).then((tasks: Tasks) => {
      if (allFinish(tasks)) {
        // 不存在未完成任务清除定时器
        clearTimer()
      } else {
        // 存在未完成任务
        if (!timerRef.current) {
          // 没有定时器时创建定时器
          timerRef.current = setInterval(() => {
            refreshTaskList()
          }, 5000)
        }
      }
    })
  }

  useEffect(() => {
    if (taskVisible) {
      setCategory(getCategory(taskTab))
      refreshTaskList()
    } else {
      setCategory(null)
      clearTimer()
    }
  }, [taskVisible, taskTab])

  const clearTimer = () => {
    clearInterval(timerRef.current as NodeJS.Timer)
    timerRef.current = null
  }

  const changeTab = (key: string) => {
    clearTimer()
    setCategory(getCategory(key))
    globalStore.changeTaskTab(key)
  }

  const getCategory = (key: string) => {
    return tabList[Number(key)].category
  }

  const closeTask = () => {
    globalStore.closeTaskPanel()
  }

  const cleanTask = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: t('确定要清空全部任务？'),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => store.cleanTask(category!),
    })
  }

  return (
    <Drawer
      width='380'
      bodyStyle={bodyStyle}
      // 设置非透明颜色会出现颜色闪动情况
      maskStyle={maskStyle}
      placement='right'
      closable={false}
      onClose={closeTask}
      visible={taskVisible}
      destroyOnClose
    >
      <Tabs
        tabBarGutter={64}
        tabBarStyle={{
          width: '100%',
          position: 'fixed',
          padding: '0 32px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #eceef2',
          zIndex: 9999,
        }}
        defaultActiveKey={taskTab}
        onChange={changeTab}
      >
        {_.map(tabList, (tabItem) => (
          <TabPane tab={tabItem.tab} key={tabItem.key}>
            <TaskList taskList={tabItem.dataList} taskObj={tabItem.dataObj} />
            <div
              className='gm-flex gm-flex-justify-center gm-flex-align-center task-list-clear'
              onClick={cleanTask}
            >
              {t('清空全部任务')}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </Drawer>
  )
})

export default TaskPanel
