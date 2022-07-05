/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { useState, forwardRef, useImperativeHandle, Key } from 'react'
import { DataNode } from '@/common/interface'
import { t } from 'gm-i18n'
import { CreateCategory } from 'gm_api/src/merchandise'
import { TreeSelect, Modal, Form, Input, message } from 'antd'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'

interface AddCategoryModalProps {
  treeData: DataNode[]
  treeMap: { [key: string]: DataNode }
  fetchData: (ids?: Key[]) => void
}

export interface ModalRef {
  handleOpen: () => void
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

const AddCategoryModal = forwardRef<ModalRef, AddCategoryModalProps>(
  (props, ref) => {
    const [form] = Form.useForm()

    const { treeData, fetchData, treeMap } = props

    const [visible, setVisible] = useState(false)

    useImperativeHandle(ref, () => ({
      handleOpen,
    }))

    const handleOpen = () => {
      setVisible(true)
    }

    const handleCancel = () => {
      setVisible(false)
      form.resetFields()
    }

    const handleOk = () => {
      form
        .validateFields()
        .then((value) => {
          return CreateCategory({ category: value })
        })
        .then((json) => {
          const { category } = json.response
          if (category) {
            message.success(t('新增商品分类成功'))
            if (typeof fetchData === 'function') {
              const parentNode = treeMap[category.parent_id]
              const { ids } = getCategoryValue(
                [parentNode.title, category.name],
                [category.parent_id, category.category_id],
                treeMap,
              )
              fetchData(ids)
            }
            handleCancel()
          }
        })
    }

    return (
      <Modal
        title={t('新增商品分类')}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form name='AddCategoryModal' {...layout} form={form}>
          <Form.Item
            label={t('分类名称')}
            name='name'
            rules={[
              { required: true, message: t('请输入分类名称') },
              { max: 30, message: t('分类名称不能超过30个字') },
            ]}
          >
            <Input placeholder={t('请输入分类名称')} />
          </Form.Item>

          <Form.Item
            label={t('上级分类')}
            name='parent_id'
            rules={[{ required: true, message: t('请选择上级分类') }]}
          >
            <TreeSelect treeData={treeData} placeholder={t('请选择')} />
          </Form.Item>
        </Form>
      </Modal>
    )
  },
)

export default AddCategoryModal
