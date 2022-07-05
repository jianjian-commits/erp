/**
 * @description 商品列表-批量修改商品分类弹窗
 */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { message, Modal, Cascader, Form } from 'antd'
import { t } from 'gm-i18n'
import { BulkUpdateSkuV2, Sku_SkuType } from 'gm_api/src/merchandise'
import { DataOption } from '@/common/interface'
import globalStore from '@/stores/global'
import store from '@/pages/merchandise/manage/merchandise_list/list/store'

export interface BatchOperateProps {
  isModalVisible: boolean
  /** 商品分类数据 */
  categoryOption: DataOption[]
  closeModal: () => void
}

const BatchEditCategory: FC<BatchOperateProps> = observer((props) => {
  const {
    filter,
    selected,
    isAllSelected,
    setSelected,
    setIsAllSelected,
    count,
  } = store
  const { isModalVisible, categoryOption, closeModal } = props

  const [categoryIds, setCategoryIds] = useState<string[] | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [categoryForm] = Form.useForm()

  const batchEditCategory = () => {
    if (!categoryIds) return

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
      category_id: categoryIds[categoryIds.length - 1],
    })
      .then((json) => {
        setIsLoading(false)
        setSelected([])
        setIsAllSelected(false)
        globalStore.showTaskPanel('1')
        message.success(t('正在批量修改分类，请稍后刷新查看'))
        closeModal()
      })
      .catch(() => {
        message.error(t('批量修改分类任务创建失败'))
      })
  }

  const onCategoryChange = (values: any) => {
    setCategoryIds(values)
  }

  return (
    <Modal
      title={t('批量修改分类')}
      visible={isModalVisible}
      confirmLoading={isLoading}
      onOk={categoryForm.submit}
      onCancel={closeModal}
    >
      <p style={{ fontWeight: 500 }}>
        {t(`已选条目：${isAllSelected ? count : selected.length}`)}
      </p>
      <Form form={categoryForm} onFinish={batchEditCategory}>
        <Form.Item
          name='category'
          required
          label={t('所属分类')}
          rules={[{ required: true, message: t('请选择所属分类') }]}
        >
          <Cascader
            style={{ width: 220 }}
            changeOnSelect
            expandTrigger='hover'
            value={categoryIds}
            options={categoryOption}
            onChange={onCategoryChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default BatchEditCategory
