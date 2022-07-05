import React, { useCallback } from 'react'
import { t } from 'gm-i18n'
import {
  OrderExportSettings_Type,
  OrderExportSettings_Field,
} from 'gm_api/src/preference'
import {
  FieldSelectorModal,
  useFieldState,
  SelectedFields,
} from '@/common/components/field_selector'
import updateSelectedFields from './service/update_selected_fields'
import useFetchFields from './service/use_fetch_fields'

import _ from 'lodash'
import { message } from 'antd'

type SubmitValueType = SelectedFields<
  OrderExportSettings_Field,
  OrderExportSettings_Type
>

const tabs = [
  { id: OrderExportSettings_Type.TYPE_BILL_DETAIL, name: t('账单明细') },
  { id: OrderExportSettings_Type.TYPE_ORDER_DETAIL, name: t('订单明细') },
  { id: OrderExportSettings_Type.TYPE_SKU_SUMMARY, name: t('商品汇总') },
  {
    id: OrderExportSettings_Type.TYPE_CUSTOMIZE_SUMMARY,
    name: t('订单类型汇总'),
  },
]

export interface ExportFieldsEditProps {
  visible?: boolean
  onClose?: (value: false) => void
}

const ExportFieldsEdit: React.VFC<ExportFieldsEditProps> = (props) => {
  const { visible, onClose } = props

  const handleClose = useCallback(() => {
    onClose && onClose(false)
  }, [onClose])

  const [instance] = useFieldState<
    OrderExportSettings_Field,
    OrderExportSettings_Type,
    string
  >()

  const { fetchFields, getRawData } = useFetchFields()

  const onSubmit = async (value: SubmitValueType[]) => {
    const taskList = _.filter(value, (item) => item.isDirty).map((item) => {
      const { id, name, fields } = item
      const task = async () => {
        try {
          const raw = getRawData(id)
          if (!raw) {
            return Promise.reject(Error(`${name}（${id}）Tab 缺少原始数据`))
          }
          await updateSelectedFields(
            _.map(fields, (item) => ({ ...item, show: true })),
            raw,
          )
          instance.resetDirty(id)
          message.success({
            key: name,
            content: `${name}导出字段保存成功`,
          })
          return Promise.resolve()
        } catch (error) {
          console.error(error)
          message.error({
            key: name,
            content: `${name}导出字段保存失败`,
          })
          return Promise.resolve()
        }
      }
      return task()
    })
    await Promise.all(taskList)
  }

  return (
    <FieldSelectorModal
      instance={instance}
      visible={visible}
      onClose={handleClose}
      width={1024}
      title={t('导出设置')}
      tabs={tabs}
      fetcher={fetchFields}
      fieldKey='key'
      labelKey='header'
      onSubmit={onSubmit}
    />
  )
}

export default ExportFieldsEdit
