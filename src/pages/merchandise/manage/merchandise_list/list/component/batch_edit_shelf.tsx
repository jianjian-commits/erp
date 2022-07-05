/**
 * @description 商品列表-批量修改货位弹窗
 */
import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { message, Modal, Form, Cascader } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { BulkUpdateSkuV2, Sku_SkuType } from 'gm_api/src/merchandise'
import { ListShelf } from 'gm_api/src/inventory'
import { DataNode, DataOption } from '@/common/interface'
import { formatTreeData } from '@/common/util'
import globalStore from '@/stores/global'
import store from '@/pages/merchandise/manage/merchandise_list/list/store'

export interface BatchOperateProps {
  isModalVisible: boolean
  closeModal: () => void
}

const BatchEditShelf: FC<BatchOperateProps> = observer((props) => {
  const {
    filter,
    selected,
    isAllSelected,
    setSelected,
    setIsAllSelected,
    count,
  } = store
  const { isModalVisible, closeModal } = props

  const [shelfOption, setShelfOption] = useState<DataOption[]>([])
  const [shelfIds, setShelfIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    getShelfList()
  }, [])

  const formatCascaderData = (treeData: DataNode[]): DataOption[] => {
    if (treeData.length === 0) return []
    return treeData.map((item) => {
      const children = formatCascaderData(item.children || [])
      return {
        value: item.value,
        label: item.title,
        disabled: children.length ? false : item.disabled,
        children,
      }
    })
  }

  const getShelfList = () => {
    ListShelf().then((json) => {
      const shelves: DataNode[] = _.map(json.response.shelves, (item) => {
        const { name, shelf_id, is_leaf, parent_id } = item
        return {
          value: shelf_id,
          key: shelf_id,
          title: name,
          disabled: !is_leaf,
          parentId: parent_id || '0',
          children: [],
        }
      })

      const shelvesTree = formatTreeData(shelves)
      setShelfOption(formatCascaderData(shelvesTree))
    })
  }

  const batchEditShelf = () => {
    setIsLoading(true)
    const newFilter = {
      ...filter,
      category_id: filter.category_ids
        ? filter.category_ids[filter.category_ids.length - 1]
        : '',
    }

    const params = isAllSelected ? newFilter : { sku_ids: selected }

    BulkUpdateSkuV2({
      filter_params: { ...params, sku_type: Sku_SkuType.NOT_PACKAGE },
      shelf_id: shelfIds[shelfIds.length - 1],
    })
      .then((json) => {
        setIsLoading(false)
        setSelected([])
        setIsAllSelected(false)
        globalStore.showTaskPanel('1')
        message.success(t('正在批量修改默认货位，请稍后刷新查看'))
        closeModal()
      })
      .catch(() => {
        message.error(t('批量修改默认货位任务创建失败'))
      })
  }

  const onShelfChange = (values: any) => {
    setShelfIds(values)
  }

  return (
    <Modal
      title={t('批量修改默认货位')}
      visible={isModalVisible}
      confirmLoading={isLoading}
      onOk={batchEditShelf}
      onCancel={closeModal}
    >
      <p style={{ fontWeight: 500 }}>
        {t(`已选条目：${isAllSelected ? count : selected.length}`)}
      </p>
      <Form.Item required label={t('默认货位')}>
        <Cascader
          style={{ width: 220 }}
          expandTrigger='hover'
          value={shelfIds}
          options={shelfOption}
          onChange={onShelfChange}
        />
      </Form.Item>
    </Modal>
  )
})

export default BatchEditShelf
