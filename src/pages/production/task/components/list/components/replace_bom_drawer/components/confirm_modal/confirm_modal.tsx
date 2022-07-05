import globalStore from '@/stores/global'
import { Checkbox, Modal, ModalProps } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { t } from 'gm-i18n'
import React, { FC, useEffect, useState } from 'react'

/**
 * 确认弹窗的组件函数，用来展示确认替换物料的弹窗
 */
const ConfirmModal: FC<ModalProps> = ({ visible, onOk, onCancel }) => {
  const currentRule = globalStore.productionSetting.bom_material_replace_type

  const [checked, setChecked] = useState(false)

  /**
   * 处理确认框勾选事件，勾选或取消勾选确认框时触发
   * 更新确认框勾选状态
   */
  const handleCheck = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked)
  }

  // 每次关闭弹窗时取消勾选
  useEffect(() => {
    if (!visible) {
      setChecked(false)
    }
  }, [visible])

  /**
   * 渲染组件
   */
  return (
    <Modal
      title={t('提示')}
      visible={visible}
      okButtonProps={{ disabled: !checked }}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p style={{ fontSize: '18px' }}>确定替换组成物料吗？</p>
      <p style={{ color: 'red' }}>
        {currentRule === 1
          ? '1、替换后，非已完成状态的原物料关联下游计划以及任务将被删除，关联的采购计划也将被同步删除'
          : '1、替换后，原有关联的下游计划及任务会保留'}
        <br />
        2、按替换后物料生成关联计划、任务以及采购计划
      </p>
      <Checkbox
        checked={checked}
        style={{ fontSize: '12px' }}
        onChange={handleCheck}
      >
        我已阅读以上提示，知晓风险
      </Checkbox>
    </Modal>
  )
}

export default ConfirmModal
