/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/no-nesting */
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react'
import { Form, Input, Modal, message } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'
import classNames from 'classnames'
import { CategoryImage } from 'gm_api/src/merchandise'
import { imageDomain } from '@/common/service'
import { DataNode } from '@/common/interface'

export interface AddCategoryRef {
  handleOpen: (node?: DataNode) => void
}

interface IconComponentProps {
  image: CategoryImage
  handleSelect: (id: string) => void
  selectedId?: string
  isEdit: boolean
  currentNode: DataNode
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}

/** 图标组件 */
const IconComponent = (props: IconComponentProps) => {
  const {
    image,
    selectedId,
    handleSelect,
    isEdit,
    currentNode: { icon },
  } = props
  return (
    <div
      className={classNames({
        'image-item': true,
        'image-item-selected': image.category_image_id === selectedId,
        'image-item-edit-selected': isEdit && image.category_image_id === icon,
      })}
      onClick={() => handleSelect(image.category_image_id || '')}
    >
      <img src={imageDomain + image.image?.path} />
      {isEdit && image.category_image_id === icon && (
        <span className='image-item-selected-inner' />
      )}
    </div>
  )
}

/** 添加一级/根分类 */
const AddCategory = forwardRef<AddCategoryRef>((_, ref) => {
  const [form] = Form.useForm()
  const [visible, setVisble] = useState(false)
  const [loading, setLoading] = useState(false)
  /** 已选择的图标ID */
  const [selectedImageId, setSelectedImageId] = useState('')
  /** 当前节点的信息，编辑状态下存在 */
  const [currentNode, setCurrentNode] = useState<DataNode>()

  /** 清除副作用 */
  useEffect(() => handleCancel, [])

  useImperativeHandle(ref, () => ({
    handleOpen,
  }))

  const handleOk = () => {
    form.validateFields().then((value) => {
      if (!selectedImageId) {
        message.error('请选择分类图标')
        return
      }
      setLoading(true)
      /** 根据 currentNode 判断新建/编辑 */
      const onSubmit = !currentNode
        ? store.handleCreateCategory
        : store.handleUpdateCategory
      const node = currentNode && store.treeDataMap[currentNode.value]
      const params = {
        ...node,
        parent_id: '0',
        name: value.name,
        icon: selectedImageId,
      }

      onSubmit(params)
        .then(() => {
          message.success('操作成功')
          store.getTreeData()
          handleCancel()
        })
        .finally(() => setLoading(false))
    })
  }

  const handleOpen = (node?: DataNode) => {
    if (node) {
      const { icon = '', title } = node
      setCurrentNode(node)
      setSelectedImageId(icon)
      form.setFieldsValue({ icon })
      form.setFieldsValue({ name: title })
    }
    setVisble(true)
  }

  const handleSelect = (id: string | undefined) => {
    if (!id) return
    setSelectedImageId(id)
    form.setFieldsValue({ icon: id })
  }

  const handleCancel = () => {
    setVisble(false)
    setLoading(false)
    setSelectedImageId('')
    form.resetFields()
  }

  const isEdit = !!currentNode

  const modalTitle = isEdit ? t('编辑分类') : t('新建分类')

  return (
    <Modal
      title={modalTitle}
      width={680}
      visible={visible}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} {...formItemLayout} layout='horizontal'>
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
        <Form.Item
          label={t('选择图标')}
          name='icon'
          rules={[{ required: true }]}
        >
          <div className='category-icon' style={{ padding: '16px' }}>
            {store.iconList.map((item) => (
              <IconComponent
                isEdit={isEdit}
                image={item}
                key={item.category_image_id}
                selectedId={selectedImageId}
                currentNode={currentNode || ({} as DataNode)}
                handleSelect={handleSelect}
              />
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default observer(AddCategory)
