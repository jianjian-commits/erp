import { makeAutoObservable } from 'mobx'
import {
  UpdateMerchandiseSettings,
  MerchandiseSettings,
} from 'gm_api/src/preference'

const initMerchandiseSettings: MerchandiseSettings = {
  merchandise_settings_id: '',
  audit_quotation: false,
  sync_combine_ssu_ratio_to_menu_detail: false,
}

class ShopStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init(setting: MerchandiseSettings) {
    this.merchandise_settings = setting
  }

  merchandise_settings: MerchandiseSettings = {
    ...initMerchandiseSettings,
  }

  changeMerchandiseSetting<T extends keyof MerchandiseSettings>(
    key: T,
    value: MerchandiseSettings[T],
  ) {
    this.merchandise_settings[key] = value
  }

  updateShopSettings() {
    return UpdateMerchandiseSettings({
      merchandise_settings: {
        ...this.merchandise_settings,
      },
    })
  }
}

export default new ShopStore()
