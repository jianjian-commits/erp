/* eslint-disable promise/no-nesting */
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Form, Input, Modal, message } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'
import { toJS } from 'mobx'
import { DataNode } from '@/common/interface'
import { editLevelMap, createLevelMap } from '../constants'
export interface CreateSonCategoryRef {
  handleOpen: (node: DataNode, type?: Status) => void
}

type Status = 'edit' | 'add'
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

/** 添加/编辑 二级/三级分类 */
const CreateSonCategory = forwardRef<CreateSonCategoryRef>((_, ref) => {
  const [visible, setVisble] = useState(false)
  const [status, setStatus] = useState<Status>('add')
  const [currentNode, setcurrentNode] = useState<DataNode>()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => ({
    handleOpen,
  }))

  const handleOk = () => {
    if (!currentNode) return

    form.validateFields().then((value) => {
      const { name } = value
      const { key } = currentNode
      setLoading(true)
      /** 根据 currentNode 判断新建/编辑 */
      const onSubmit =
        status === 'add'
          ? store.handleCreateCategory
          : store.handleUpdateCategory
      const params =
        status === 'add'
          ? {
              parent_id: key,
              name,
            }
          : {
              ...store.treeDataMap[key],
              name,
            }
      console.log('params', params)

      onSubmit(params as any)
        .then(() => {
          setLoading(false)
          if (status === 'add') {
            // 新增节点时，要把当前父节点展开
            const { parent_id = '' } = params
            !store.expandedKeys.includes(parent_id) &&
              store.setExpandedKeys([...store.expandedKeys, parent_id])
          }
          message.success('操作成功')
          store.getTreeData()
          handleCancel()
        })
        .catch(() => {
          setLoading(false)
        })
    })
  }

  /** 打开弹窗及逻辑 */
  const handleOpen = (currentNode: DataNode, status?: Status) => {
    if (status) {
      setStatus(status)
      status === 'edit' && form.setFieldsValue({ name: currentNode.title })
    }
    setcurrentNode(currentNode)
    setVisble(true)
  }

  /** 关闭弹窗清除状态 */
  const handleCancel = () => {
    setVisble(false)
    setStatus('add')
    setLoading(false)
    setcurrentNode(undefined)
    form.resetFields()
  }

  /** 处理弹窗Title */
  const getModalTitle = () => {
    if (!currentNode?.level) return t('新建分类')
    return status === 'edit'
      ? t(`编辑${editLevelMap[currentNode.level]}级分类`)
      : t(`新建${createLevelMap[currentNode.level]}级分类`)
  }

  return (
    <Modal
      title={getModalTitle()}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <Form form={form} {...formItemLayout} layout='horizontal'>
        {status === 'add' && (
          <Form.Item label={t('上一级分类')} name='parent_name'>
            <span style={{ fontWeight: 600 }}>
              {currentNode ? currentNode.title : '-'}
            </span>
          </Form.Item>
        )}

        <Form.Item
          label={t('分类名称')}
          name='name'
          rules={[
            { required: true, message: t('请输入分类名称'), whitespace: true },
            { max: 30, message: t('分类名称不能超过30个字') },
          ]}
        >
          <Input placeholder={t('请输入分类名称')} style={{ width: 200 }} />
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default observer(CreateSonCategory)
