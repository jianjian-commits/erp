/**
 * @description 商品列表-批量修改供应商协作模式弹窗
 */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { message, Modal, Form, Select } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import {
  BulkUpdateSkuV2,
  list_Sku_SupplierCooperateModelType,
  Sku_SkuType,
  Sku_SupplierCooperateModelType,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import store from '@/pages/merchandise/manage/merchandise_list/list/store'

export interface BatchOperateProps {
  isModalVisible: boolean
  closeModal: () => void
}

const { Option } = Select

const BatchEditSupplierCo: FC<BatchOperateProps> = observer((props) => {
  const {
    filter,
    selected,
    isAllSelected,
    setSelected,
    setIsAllSelected,
    count,
  } = store
  const { isModalVisible, closeModal } = props

  const [supplierCoId, setSupplierCoId] =
    useState<Sku_SupplierCooperateModelType>(
      Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
    )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const batchEditSupplierCo = () => {
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
      supplier_cooperate_model_type: supplierCoId,
    })
      .then((json) => {
        setIsLoading(false)
        setSelected([])
        setIsAllSelected(false)
        globalStore.showTaskPanel('1')
        message.success(t('正在批量修改供应商协作模式，请稍后刷新查看'))
        closeModal()
      })
      .catch(() => {
        message.error(t('批量修改供应商协作模式任务创建失败'))
      })
  }

  const onSupplierCoChange = (values: any) => {
    setSupplierCoId(values)
  }

  return (
    <Modal
      title={t('批量修改供应商协作模式')}
      visible={isModalVisible}
      confirmLoading={isLoading}
      onOk={batchEditSupplierCo}
      onCancel={closeModal}
    >
      <p style={{ fontWeight: 500 }}>
        <span>{t('已选条目：')}</span>
        <span style={{ fontWeight: 600 }}>
          {isAllSelected ? count : selected.length}
        </span>
      </p>
      <Form.Item required label={t('供应商协作模式')}>
        <Select
          style={{ width: 220 }}
          value={supplierCoId}
          onChange={onSupplierCoChange}
        >
          {_.map(list_Sku_SupplierCooperateModelType, (item) => {
            const { value, text } = item
            return (
              <Option key={value} value={value}>
                {text}
              </Option>
            )
          })}
        </Select>
      </Form.Item>
      <p style={{ color: '#E04B20', marginTop: '4px', fontSize: '14px' }}>
        {t(
          '注意：供应商协作模式将会影响供应商账号收到的采购单样式，代分拣和代配送模式中，供应商账号收到采购单中的销售订单明细',
        )}
      </p>
    </Modal>
  )
})

export default BatchEditSupplierCo
