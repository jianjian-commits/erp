import {
  OrderExportSettings,
  OrderExportSettings_Field,
  UpdateOrderExportSettings,
} from 'gm_api/src/preference'

/**
 * 保存导出字段
 */
export default function updateSelectedFields(
  fields: OrderExportSettings_Field[],
  rawData: OrderExportSettings,
) {
  return UpdateOrderExportSettings({
    order_export_settings: {
      ...rawData,
      fields: {
        fields: fields,
      },
    },
  })
}
