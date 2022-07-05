import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { Button, Drawer, Steps } from 'antd'
import { t } from 'gm-i18n'
import { ReplaceTaskBomMaterial, Task_Type } from 'gm_api/src/production'
import React, { FC, useEffect, useState } from 'react'
import { ConfirmModal, RelatedTable, SelectedTaskTable } from './components'
import { ExpandedTask, ReplaceMaterials } from './interfaces'
import store from './store'
import './style.less'

/**
 * 物料替换抽屉的属性
 */
interface ReplaceBomDrawerProps {
  /** 计划的类型，用来展示不同的表格属性 */
  type: Task_Type
  /** 弹出的抽屉是否显示，true为显示，否则为false */
  visible: boolean
  /** 选择的计划ID */
  selected: string[]
  /** 关闭时触发的动作 */
  onClose: () => void
}

/**
 * 替换物料的任务
 */
interface ReplaceTasks {
  [taskId: string]: ReplaceMaterials
}

/**
 * 物料替换抽屉的组件函数，用来显示物料替换的抽屉
 */
const ReplaceBomDrawer: FC<ReplaceBomDrawerProps> = ({
  type,
  visible,
  selected,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTasks, setSelectedTasks] = useState<ExpandedTask[]>([])
  const [replaceTasks, setReplaceTasks] = useState<ReplaceTasks>({})
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [renderFinished, setRenderFinished] = useState(false)

  useEffect(() => {
    if (!selected.length || !visible) {
      return
    }

    store.fetchTaskList(type, selected).then((tasks) => {
      tasks = tasks.reduce((expandedTasks, task) => {
        const expandedTask = {
          ...task,
          rowSpan:
            task.inputIndex === 0 ? store.validTaskSkuMap[task.task_id] : 0,
          replaceInfo: {},
        }
        expandedTasks.push(expandedTask)
        return expandedTasks
      }, [] as ExpandedTask[])

      setSelectedTasks(tasks)
    })
  }, [selected, visible])

  useEffect(() => {
    if (!selectedTasks) {
      return
    }

    const replaceTasks = selectedTasks.reduce((tasks, task) => {
      if (!task.replaceInfo) {
        return tasks
      }

      const { replace_sku_id, replace_quantity, replace_unit_id } =
        task.replaceInfo
      if (!replace_sku_id || !replace_quantity || !replace_unit_id) {
        return tasks
      }

      const replaceTask = tasks[task.task_id] || {}
      const replaceMaterials = replaceTask.replace_materials || []
      replaceMaterials.push({
        ...task.replaceInfo,
        task_input_id: task.input?.task_input_id,
      })
      tasks[task.task_id] = {
        replace_materials: replaceMaterials,
      }

      return tasks
    }, {} as ReplaceTasks)

    setReplaceTasks(replaceTasks)
  }, [selectedTasks])

  /**
   * 处理抽屉关闭事件，手动关闭抽屉时触发
   * 关闭抽屉并把抽屉的状态改为第一步
   */
  const handleClose = () => {
    onClose()
    setCurrentStep(0)
  }

  /**
   * 处理替换物料选择事件，选择或删除替换物料时触发
   * 更新已选计划来更新替换的物料信息
   */
  const handleReplaceChange = () => {
    setSelectedTasks([...selectedTasks])
  }

  /**
   * 处理下一步事件，点击下一步按钮时触发
   * 跳转至下一步
   */
  const handleNextStep = () => {
    setCurrentStep(1)
  }

  /**
   * 处理上一步事件，点击返回上一步按钮时触发
   * 跳转回上一步
   */
  const handlePrevStep = () => {
    setCurrentStep(0)
  }

  /**
   * 处理替换物料提交事件，点击抽屉中的确定按钮时触发
   * 弹出确认框并关闭抽屉
   */
  const handleSubmit = () => {
    setConfirmModalVisible(true)
    setCurrentStep(0)
    onClose()
  }

  /**
   * 处理确认替换事件，点击确认框中的确定按钮时触发
   * 执行物料替换、关闭确认框并把抽屉的状态改为第一步
   */
  const handleConfirm = () => {
    setConfirmModalVisible(false)
    ReplaceTaskBomMaterial({
      replace_material_map: replaceTasks,
    })
    globalStore.showTaskPanel('1')
    // 把所有状态初始化，清空列表，回到第一步
    setCurrentStep(0)
    setSelectedTasks([])
  }

  /**
   * 处理取消确认事件，以任何方式取消确认时触发
   * 关闭确认框并展示抽屉
   */
  const handleCancel = () => {
    setConfirmModalVisible(false)
  }

  /**
   * 渲染组件
   */
  return (
    <Drawer
      title={t('物料替换')}
      width='1080px'
      placement='right'
      visible={visible}
      onClose={handleClose}
    >
      <div className='box'>
        <Steps className='box' current={currentStep}>
          <Steps.Step
            title={currentStep === 0 ? t('进行中') : t('已完成')}
            description={t('选择物料，进行替换')}
          />
          <Steps.Step
            title={currentStep === 1 ? t('进行中') : t('未开始')}
            description={t('查看关联的需求/任务及采购计划，确认并完成替换')}
          />
        </Steps>
        {currentStep === 0 && (
          <SelectedTaskTable
            type={type}
            data={selectedTasks}
            onReplaceChange={handleReplaceChange}
          />
        )}
        {currentStep === 1 && (
          <RelatedTable
            task_ids={Object.keys(replaceTasks)}
            setRender={setRenderFinished}
          />
        )}
        <Flex className='box' justifyEnd>
          <Button
            className='replace-bom-button'
            disabled={!renderFinished}
            onClick={handleClose}
          >
            {t('取消')}
          </Button>
          {currentStep === 0 && (
            <Button
              type='primary'
              className='replace-bom-button'
              onClick={handleNextStep}
              disabled={Object.keys(replaceTasks).length === 0}
            >
              {t('下一步')}
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              className='replace-bom-button'
              disabled={!renderFinished}
              onClick={handlePrevStep}
            >
              {t('返回上一步')}
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              type='primary'
              className='replace-bom-button'
              disabled={!renderFinished}
              onClick={handleSubmit}
            >
              {t('确定')}
            </Button>
          )}
        </Flex>
      </div>
      <ConfirmModal
        visible={confirmModalVisible}
        closable
        onOk={handleConfirm}
        onCancel={handleCancel}
      />
    </Drawer>
  )
}

export default ReplaceBomDrawer
