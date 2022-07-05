import {
  InventorySettings,
  InventorySettings_ExpireStockSettingsItem,
  UpdateInventorySettings,
} from 'gm_api/src/preference'
import { makeAutoObservable, set } from 'mobx'
import globalStore from '@/stores/global'
import _ from 'lodash'
import { Category } from 'gm_api/src/merchandise'

class Store {
  salesInvoicing: InventorySettings = {
    ...globalStore.salesInvoicingSetting,
    mult_warehouse: false,
  }

  categorys: Category[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init(data?: InventorySettings, categorys?: Category[]) {
    data && (this.salesInvoicing = data)
    categorys && (this.categorys = categorys)

    // get Category
  }

  changeValue<T extends keyof InventorySettings>(
    name: T,
    value: InventorySettings[T],
  ) {
    this.salesInvoicing[name] = value
  }

  change_expire_stock_settings(
    index: number,
    item: Partial<InventorySettings_ExpireStockSettingsItem>,
  ) {
    set(
      this.salesInvoicing.expire_stock_settings?.expire_stock_settings!,
      index,
      {
        ...this.salesInvoicing.expire_stock_settings?.expire_stock_settings![
          index
        ],
        ...item,
      },
    )
  }

  updateSetting() {
    return UpdateInventorySettings({
      inventory_settings: _.omit(
        this.salesInvoicing,
        'available_stock_settings',
      ),
      inventory_settings_id: this.salesInvoicing.inventory_settings_id,
    }).then((json) => {
      localStorage.setItem(
        'gmSalesInvoicingSetting',
        JSON.stringify(json.response.inventory_settings),
      )

      return json
    })
  }
}

export default new Store()
