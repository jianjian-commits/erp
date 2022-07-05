import React, { FC, useState, useEffect } from 'react'
import { Flex, Tip } from '@gm-pc/react'
import { Modal, Input, Popconfirm, Button } from 'antd'
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import {
  ListProductionLine,
  ProductionLine,
  UpdateProductionLine,
  CreateProductionLine,
  DeleteProductionLine,
} from 'gm_api/src/production'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import './style.less'

export interface ProductionLineModalType {
  visible: boolean
  setVisible(visible: boolean): void
  onClose?: () => void
}

const Item: FC<{
  line: ProductionLine
  className?: string
  onDelete(id: string): void
  onAddOrEdit(): void
}> = ({ line, className, onDelete, onAddOrEdit }) => {
  const [editStatus, setEditStatus] = useState(!line.production_line_id)
  const [editLine, setEditLine] = useState(line)
  const isCreate = !editLine.production_line_id

  const handleEdit = () => {
    setEditStatus(true)
  }

  const handleSave = () => {
    if (!editLine.name) return
    const production_line = editLine
    const Request = isCreate ? CreateProductionLine : UpdateProductionLine
    Request({ production_line }).then(() => {
      const msg = isCreate ? t('添加成功') : t('修改成功')
      Tip.success(msg)
      onAddOrEdit()
    })
  }

  const handleCancel = () => {
    if (isCreate) return
    setEditStatus(false)
    setEditLine(line)
  }

  const handleDelete = () => {
    onDelete(editLine.production_line_id || '')
  }

  return editStatus ? (
    <Input
      className={className}
      value={editLine.name}
      onChange={(e) => setEditLine({ ...editLine, name: e.target.value })}
      suffix={
        <Flex justifyBetween alignCenter className='tw-w-8'>
          <CheckOutlined style={{ color: '#0363ff' }} onClick={handleSave} />
          <CloseOutlined onClick={handleCancel} />
        </Flex>
      }
    />
  ) : (
    <Flex
      justifyBetween
      alignCenter
      className={classNames('production-line-modal-item', className)}
    >
      <div>{editLine.name}</div>
      <Flex justifyBetween alignCenter className='tw-w-8'>
        <EditOutlined onClick={handleEdit} />
        <Popconfirm
          title={t('删除产线后，与该产线绑定的BOM将更改为没有绑定产线的状态')}
          onConfirm={handleDelete}
        >
          <DeleteOutlined />
        </Popconfirm>
      </Flex>
    </Flex>
  )
}

const ProductionLineModal: FC<ProductionLineModalType> = ({
  visible,
  setVisible,
  onClose,
}) => {
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([])

  const fetchProductionLines = () => {
    return ListProductionLine().then((res) => {
      const lines = res.response.production_lines
      setProductionLines(lines)
    })
  }

  useEffect(() => {
    if (visible) {
      fetchProductionLines()
    }
  }, [visible])

  const handleOk = () => {
    setVisible(false)
    onClose && onClose()
  }

  const handleDelete = (id: string) => {
    DeleteProductionLine({ production_line_id: id }).then(() => {
      Tip.success('删除成功')
      return fetchProductionLines()
    })
  }

  const handleAdd = () => {
    if (!productionLines.every((line) => line.production_line_id)) return
    const line = [{ name: '' } as ProductionLine].concat(productionLines)
    setProductionLines(line)
  }

  const handleAddOrEdit = () => {
    fetchProductionLines()
  }

  return (
    <Modal
      title={t('新建产线')}
      visible={visible}
      onCancel={handleOk}
      footer={<Button onClick={handleOk}>{t('返回')}</Button>}
      bodyStyle={{ maxHeight: '240px', overflow: 'scroll' }}
    >
      <Flex justifyBetween alignCenter className='production-line-modal-item'>
        <div>{t('新增产线')}</div>
        <PlusOutlined onClick={handleAdd} />
      </Flex>
      {productionLines.map((line) => (
        <Item
          key={line.production_line_id}
          line={line}
          className='tw-mt-3'
          onDelete={handleDelete}
          onAddOrEdit={handleAddOrEdit}
        />
      ))}
    </Modal>
  )
}

export default ProductionLineModal
