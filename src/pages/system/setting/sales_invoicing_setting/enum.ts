import { t } from 'gm-i18n'
import { InventorySettings_AvailableStockSettings } from 'gm_api/src/preference'

export const AVAILABLE_STOCK: {
  text: string
  value: keyof InventorySettings_AvailableStockSettings
}[] = [
  // { text: t('+ 计划生产库存'), value: 'plan_in_stock' },
  { text: t('+ 在途库存'), value: 'in_transit_stock' },
  { text: t('- 冻结库存'), value: 'frozen_stock' },
]
